import { Resource } from './resource';
import { flatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { Table } from './table';
import { User } from './user';
import { DataService } from './data.service';
import { MessageService } from './message.service';
import { GameService } from './game.service';
import { IStringStringMap, HelperService } from './helper.service';
import { RemoteFormError } from './remoteFormError';


@Injectable()
export class TableService extends DataService {

  constructor(
    http: HttpClient,
    messageService: MessageService,
    helperService: HelperService,
    private gameService: GameService
  ) {
    super(http, messageService, helperService);
    this.dataUrl = 'api/tables';
    this.resourceClass = Table;
  }

  getOne(id: string): Observable<Table> {
    return super.getOne.call(this, id);
  }

  getMany(): Observable<Table[]> {
    return super.getMany.call(this);
  }

  searchResources(dataMap: IStringStringMap): Observable<Table[]> {
    return super.searchResources.call(this, dataMap);
  }

  addOne(dataMap: IStringStringMap): Observable<Table> {
    return super.addOne.call(this, dataMap);
  }

  updateOne(id: string, dataMap: IStringStringMap): Observable<Table> {
    return super.updateOne.call(this, id, dataMap);
  }

  public createTable(gameId, tableName, ownerId): Observable<Table> {

    return this.gameService.getOne(gameId).do(game => {
      if (!game) {
        throw new RemoteFormError('Game not found', 'gameId', 'notfound');
      }
      // console.log(game);
    })
      .flatMap(_ => this.addOne({
        gameId, tableName, ownerId
      }));

  }

}

