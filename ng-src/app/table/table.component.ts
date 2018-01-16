import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';

import { UserTableService } from './../user-table.service';
import { UserService } from './../user.service';
import { TableService } from './../table.service';
import { HelperService } from './../helper.service';
import { GameService } from './../game.service';
import { DataHelperService } from '../helpers/data-helper.service';
import { Table } from './../table';
import { User } from './../user';
import { UserTable } from './../user-table';

interface TableState {
  table: Table;
  currentUser: User;
  isJoinedByCurrentUser: UserTable;
  isCurrentTable: boolean;
  users: User[];
  userTables: UserTable[];
  loadingFinished: boolean;
  gameName: string;
  ownerName: string;
  isOwnedByCurrentUser: boolean;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements OnInit, OnDestroy {

  private tableId: string;
  private subs: Subscription[];
  private state: TableState;


  constructor(private route: ActivatedRoute,
    private helperService: HelperService,
    private router: Router,
    private userTableService: UserTableService,
    private dataHelperService: DataHelperService,
    private userService: UserService,
    private gameService: GameService,
    private tableService: TableService) {

    this.subs = [];

    this.state = {
      table: null,
      currentUser: this.userService.currentUser,
      isJoinedByCurrentUser: null,
      isCurrentTable: false,
      users: [],
      userTables: [],
      loadingFinished: false,
      gameName: '',
      ownerName: '',
      isOwnedByCurrentUser: false
    };

  }

  ngOnInit() {

    const sub = this.route.params.subscribe(params => {

      this.tableId = params['id'];

      this.refreshTableData();

    });
  }

  refreshTableData() {

    let newState = { ...this.state };

    const tableObs = this.tableService.getOne(this.tableId)
      .flatMap(table => {

        newState.table = table;

        let gameObs;
        let ownerObs;

        if (this.state.gameName) {
          gameObs = of('');
        } else {
          gameObs = this.gameService.getOne(table.values.gameId).do(game => {
            newState.gameName = game.values.name;
          });
        }

        if (this.state.ownerName) {
          ownerObs = of('');
        } else {
          ownerObs = this.userService.getOne(table.values.ownerId).do(owner => {
            newState.ownerName = owner.values.username;
          });
        }

        return Observable.forkJoin([gameObs, ownerObs]);

      });

    const userTablesObs = this.userTableService.getOrderedUserTablesList(this.tableId)
      .flatMap(userTables => {
        const isJoinedByCurrentUser = userTables.find(uT =>
          uT.values.userId === this.state.currentUser.values.id);

        const isOwnedByCurrentUser = newState.table.values.ownerId ===
          this.state.currentUser.values.id;


        newState = {
          ...newState,
          userTables,
          isJoinedByCurrentUser,
          isOwnedByCurrentUser
        };

        newState.isCurrentTable = !!this.state.isJoinedByCurrentUser;

        // console.log(isJoinedByCurrentUser);

        return this.userService.searchByIds(userTables.map(e => e.values.userId))
          .do(users => newState.users = users);
      });

    const obsArray = [tableObs, userTablesObs];

    const sub = Observable.forkJoin(obsArray).subscribe(_ => {

      // console.log(results);
      if (newState.users.length) {

      }

      newState.loadingFinished = true;

      newState.userTables.forEach((ut, i) => ut.user = newState.users[i]);
      // console.log(newState);
      this.state = newState;
      console.log('refresh');
    },
      e => {
        console.log(e);
        // console.log('Could not retrieve table');
      });

    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  joinTable() {

    const dataMap = {
      tableId: this.state.table.values.id,
      userId: this.userService.currentUser.values.id
    };

    const sub = this.dataHelperService.joinTable(dataMap)
      .subscribe(
      _ => this.refreshTableData(),
      e => console.log(e)
      );

    this.subs.push(sub);

  }

  leaveTable() {

    const dataMap = {
      tableId: this.state.table.values.id,
      userId: this.userService.currentUser.values.id
    };

    const sub = this.userTableService.searchResources(dataMap).map(resources => {
      if (!resources || !resources.length) {
        throw new Error('User have already left the table');
      }
      return resources[0].values.id;
    })
      .flatMap(utid => this.userTableService.deleteOne(utid))
      .subscribe(
      _ => this.refreshTableData(),
      e => console.log(e)
      );

    this.subs.push(sub);

  }

  toggleTableReady() {
    let obs: Observable<Table>;
    if (this.state.table.values.state === '0') {
      obs = this.tableService.updateOne(this.state.table.values.id, { state: '1' });
    } else if (this.state.table.values.state === '1') {
      obs = Observable.forkJoin([
        this.tableService.updateOne(this.state.table.values.id, { state: '0' }),
        this.userTableService.updateWhere({ tableId: this.state.table.values.id }, { isReady: '0' })
      ]).map(results => results[0]);
    } else {
      return;
    }

    const sub = obs.subscribe(
      _ => this.refreshTableData(),
      e => console.log(e)
    );

    this.subs.push(sub);

  }



  toggleUserTableReady() {

    // console.log(this.state.isJoinedByCurrentUser.values.isReady);
/*

    if (this.state.isJoinedByCurrentUser.values.isReady === '1') {
      obs = this.userTableService.searchOne({
        tableId: this.state.table.values.id,
        userID: this.state.currentUser.values.id
      })
      .flatMap(userTable => this.userTableService.updateOne(userTable.values.id, {isReady: '0'}));
    } else if (this.state.isJoinedByCurrentUser.values.isReady === '0') {
      obs = this.userTableService.setUserTableReadyState(this.state.table.values.id, '1');
    } else {
      return;
    }
    */

    const sub = this.userTableService.toggleUserTableReadyState({
      tableId: this.state.table.values.id,
      userId: this.state.currentUser.values.id
    })
    .subscribe(
      _ => this.refreshTableData(),
      e => console.log(e)
    );

    this.subs.push(sub);

  }

}
