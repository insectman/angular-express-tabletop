import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { UserTableService } from './../user-table.service';
import { GameService } from './../game.service';
import { UserService } from './../user.service';
import { TableService } from './../table.service';
import { HelperService, IStringStringMap } from './../helper.service';

@Injectable()
export class DataHelperService {

  constructor(
    private userTableService: UserTableService,
    private gameService: GameService,
    private userService: UserService,
    private tableService: TableService,
    private helperService: HelperService,
  ) { }

  joinTable(dataMap: IStringStringMap): Observable<any> {
    return this.userTableService.searchResources(dataMap).map(resources => {
      // console.log(resources);
      if (resources && resources.length) {
        throw new Error('User have already joined the table');
      }
    })
      .flatMap(_ => this.userTableService.deleteWhere({ userId: dataMap.userId }))
      .flatMap(_ => this.userTableService.addOne({
        ...dataMap,
        timestamp: '' + new Date().getTime()
      }))
      .do(resource => {
        // console.log(resource);
        if (!resource) {
          throw new Error('Could not join table');
        }
      });
  }

ensureGameExistence(gameId): Observable<any> {
  return this.gameService.getOne(gameId).do(game => {
    if (!game) {
      throw new Error('Game not found');
    }
  });
}

}
