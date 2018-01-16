import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { MessageService } from './message.service';
import { Resource } from './resource';

export interface IStringTMap<T> { [key: string]: T; }
export interface INumberTMap<T> { [key: number]: T; }

export type IStringAnyMap = IStringTMap<any>;
export type INumberAnyMap = INumberTMap<any>;

export type IStringStringMap = IStringTMap<string>;
export type INumberStringMap = INumberTMap<string>;
export type IStringStringOrNumberMap = IStringTMap<string | number>;

export type IStringNumberMap = IStringTMap<number>;
export type INumberNumberMap = INumberTMap<number>;

export type IStringBooleanMap = IStringTMap<boolean>;
export type INumberBooleanMap = INumberTMap<boolean>;




@Injectable()
export class HelperService {

  constructor(
    private messageService: MessageService
  ) { }

  public maps = {

    mapToQueryString: function (map: IStringStringOrNumberMap) {

      const queryChunks = [];

      for (const param in map) {
        if (Object.prototype.hasOwnProperty.call(map, param)) {
          queryChunks.push(param + '=' + map[param]);
        }
      }

      return queryChunks.join('&');

    }

  };


  public observable = {

    log: function(serviceName, operation, error): void {
      this.messageService.add(serviceName + ': ' + `${operation} failed: ${error.message}`);
    },

    handleResourceError: function <T>(serviceName, operation = 'operation', result?: T) {
      return (error: any): Observable<Resource> => {

        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // TODO: better job of transforming error for user consumption
        this.log(serviceName, operation, error);

        // Let the app keep running by returning an empty result.
        return Observable.throw(error.message);
      };
    },

    /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError: function <T>(serviceName, operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {

        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // TODO: better job of transforming error for user consumption
        this.log(serviceName, operation, error);

        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }

  };

}
