import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import {URLSearchParams} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';
import { Params } from '@angular/router';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Resource } from './resource';
import { RemoteFormError } from './remoteFormError';
import { MessageService } from './message.service';
import { IStringStringMap, HelperService } from './helper.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class DataService {

  protected dataUrl: string;  // URL to web api
  protected resourceClass;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    protected helperService: HelperService
  ) {
    this.resourceClass = Resource;
    this.resourceClass.prototype = Resource.prototype;
  }

  handleResourceError(operation: string, result?) {
    return this.helperService.observable.handleResourceError('DataService', operation, result);
  }

  private log = function (msg: string) {
    this.messageService.add(this.constructor.name + ': ' + msg);
  };

  /** GET resources from the server */
  protected getMany(): Observable<Resource[]> {
    return this.http.get<IStringStringMap[]>(this.dataUrl)
      .pipe(
      tap(_ => this.log(`fetched many ${this.resourceClass.name}s`)),
      catchError(this.helperService.observable.handleError<Resource[]>('DataService', 'getMany', []))
      ).map(dataArray => {
        if (!dataArray.length) {
          return [];
        }
        return Array.prototype.map.call(dataArray, (data) => new this.resourceClass(data));
      });

  }

  /** GET resource by id. Will 404 if id not found */
  protected getOne(id: string): Observable<Resource> {
    const url = `${this.dataUrl}/${id}`;
    return this.http.get<IStringStringMap>(url)
      .map(dataMap => {
        this.log(`fetched ${this.resourceClass.name} id=${id}`);
        return new this.resourceClass(dataMap);
      });
    // .catch(this.handleError<Resource>(`getOne id=${id}`));
  }

  protected searchOne(params: IStringStringMap): Observable<Resource> {
    return this.searchResources(params).map(resources => {
      if (!resources.length) {
        throw new Error(`${this.resourceClass.name} not found`);
      } else if (resources.length > 1) {
        throw new RemoteFormError(`Looked for single ${this.resourceClass.name}, found many`,
          '', 'ambiguous');
      }
      return resources[0];
    });

  }

  /** PUT: update the resource on the server */
  protected updateOne(id: string, dataMap: IStringStringMap): Observable<Resource> {

    const url = `${this.dataUrl}/${id}`;

    return this.getOne(id)
      .flatMap(oldResource => {
        const newData = { ...oldResource.values, ...dataMap };
 // console.log(oldResource.values, newData);
        return this.http.put(url, newData, httpOptions).map(data => {
          // console.log(data);
          const resource = new this.resourceClass(data);
          this.log(`updated ${this.resourceClass.name} id=${id}`);
          return resource;
        });
      });

  }

  /** POST: add a new resource to the server */
  protected addOne(dataMap: IStringStringMap): Observable<Resource> {
    return this.http.post<Resource>(this.dataUrl, dataMap/*, httpOptions*/)
      .map(data => {
        const resource = new this.resourceClass(data);
        // console.log(resource);
        this.log(`added ${this.resourceClass.name} w/ id=${resource.values.id}`);
        return resource;
      });
  }

  /** DELETE: delete the resource from the server */
  protected deleteOne(id: string): Observable<Resource> {
    const url = `${this.dataUrl}/${id}`;
    // console.log('deleteOne ' + url);
    return this.http.delete<Resource>(url, httpOptions)
      .do(_ => this.log(`deleted ${this.resourceClass.name} id=${id}`));
  }

  protected searchByIds(ids: string[]): Observable<Resource[]> {
    if (!ids.length) {
      return of([]);
    }
    return this.getMany().map(resources => {
      const filtered = resources.filter(resource => ids.indexOf(resource.values.id) !== -1);
      if (filtered.length !== ids.length) {
        throw new Error('failed to find some of the ids');
      }
      resources = [];
      ids.forEach(id => resources.push(filtered.find(e => e.values.id === id)));
      this.log(`searched ${this.resourceClass.name}s by ids`);
      return resources;
    });

  }

  deleteWhere(dataMap: IStringStringMap): Observable<Resource[]> {

    return this.searchResources(dataMap)
      .flatMap(resources => {
        const obs = resources.map(resource => this.deleteOne(resource.values.id));

        if (!obs.length) {
          return of([]);
        }

        return Observable.forkJoin(obs);
      });

  }

  updateWhere(dataMap: IStringStringMap, updateDataMap: IStringStringMap): Observable<Resource[]> {

    return this.searchResources(dataMap)
      .flatMap(resources => {
        const obs = resources.map(resource => this.updateOne(resource.values.id, updateDataMap));

        if (!obs.length) {
          return of([]);
        }

        return Observable.forkJoin(obs);
      });

  }

  protected updateByIds(ids: string[], dataMap: IStringStringMap) {

  }

  /* GET resources whose name contains search term */
  protected searchResources(dataMap: IStringStringMap): Observable<Resource[]> {
    // console.log(this.resourceClass.name);
    const queryString = this.helperService.maps.mapToQueryString(dataMap);
    const url = `${this.dataUrl}/?${queryString}`;

    return this.http.get<Resource[]>(url, httpOptions)
      .map(dataArray => {
        const resourcesArray = [];
        this.log(`search ${this.resourceClass.name}`);
        Array.prototype.forEach.call(dataArray, (e) =>
          resourcesArray.push(new this.resourceClass(e)));
        return resourcesArray;
      });

  }

}
