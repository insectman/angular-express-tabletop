import { Resource } from './resource';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

import { DataService } from './data.service';
// import { UserService } from './user.service';
// import { TableService } from './table.service';
import { MessageService } from './message.service';
import { GameService } from './game.service';
import { IStringStringMap, HelperService } from './helper.service';
import { RemoteFormError } from './remoteFormError';
// import { MessageService } from './message.service';
import { UserTable } from './user-table';


@Injectable()
export class UserTableService extends DataService {

  private _currentUser;

  constructor(http: HttpClient, messageService: MessageService, helperService: HelperService,
    /*private tableService: TableService, private userService: UserService,*/
     private gameService: GameService) {

    super(http, messageService, helperService);
    this.dataUrl = 'api/userTables';
    this.resourceClass = UserTable;
  }

  getOne(userTableId: string): Observable<UserTable> {
    return super.getOne.call(this, userTableId);
  }

  searchOne(dataMap: IStringStringMap): Observable<UserTable> {
    return super.searchOne.call(this, dataMap);
  }

  addOne(dataMap: IStringStringMap): Observable<UserTable> {
    return super.addOne.call(this, dataMap);
  }

  searchResources(params: IStringStringMap): Observable<UserTable[]> {
    return super.searchResources.call(this, params);
  }

  deleteOne(userTableId: string): Observable<UserTable> {
    return super.deleteOne.call(this, userTableId);
  }

  updateOne(id: string, dataMap: IStringStringMap): Observable<UserTable> {
    return super.updateOne.call(this, id, dataMap);
  }

  updateWhere(dataMap: IStringStringMap, updateDataMap: IStringStringMap): Observable<UserTable[]> {
    return super.updateWhere.call(this, dataMap, updateDataMap);
  }

  getOrderedUserTablesList(tableId: string): Observable<UserTable[]> {

    return this.searchResources({ tableId }) // .do(r => console.log(r));
     .map(r => r.sort((e1, e2) => e1.values.timestamp > e2.values.timestamp ? 1 : -1));
  }

  getUserTablesByTableId(tableId: string): Observable<UserTable[]> {
    return this.searchResources({ tableId });
  }

  toggleUserTableReadyState(dataMap): Observable<UserTable> {

    return this.searchOne(dataMap)
      .flatMap(userTable =>  {
        // console.log(userTable);
        const isReady = userTable.values.isReady === '1' ? '0' : '1';
        return this.updateOne(userTable.values.id, {isReady} );
      });

  }

  /*
  public getTableWithUsersById(tableId: string): Observable<Table> {
    return this.tableService.getOne(tableId).do(resource => {
      if (!resource) {
        throw new Error('Table not found');
      }
    })
      .flatMap(table => this.searchResources({ tableId })
        .map(userTables => {
          const currentUserAtTable = userTables.find(userTable =>
            userTable.values.userId === this.userService.currentUser.values.id);
          table.isCurrentTable = !!currentUserAtTable;
          return userTables;
        })
        .flatMap(uTs => this.userService.searchByIds(uTs.map(e => e.values.userId))
          .map(users => {
            if (users) {
              console.log(uTs, users);
              users.forEach((user, index) => user.isReady = !!+uTs[index].values.isReady);
              console.log(users);
              table.users = users;
            }
            return table;
          })
        ))
      .flatMap(table => this.gameService.getOne(table.values.gameId).map(game => {
        if (!game) {
          throw new Error('Game not found');
        }
        table.gameName = game.values.name;
        return table;
      }))
      .flatMap(table => {
        const owner = table.users.find(user =>
          user.values.id === table.values.ownerId);

        if (owner) {
          table.ownerName = owner.values.username;
          table.isOwnedByMe = owner.values.id === this.userService.currentUser.values.id;
          return of(table);
        }

        return this.userService.getOne(table.values.ownerId).map(user => {
          if (!user) {
            throw new Error('Table owner not found');
          }
          table.ownerName = user.values.username;
          table.isOwnedByMe = user.values.id === this.userService.currentUser.values.id;
          return table;
        });
      });
  }
*/
/*
  public setUserTableReadyState(userTableId: string, isReady: string): Observable<UserTable> {
    return this.getOne(userTableId)
      .flatMap(userTable => this.updateOne(userTable.values.id,
        { ...userTable.values, isReady }));
  }
  */

}
