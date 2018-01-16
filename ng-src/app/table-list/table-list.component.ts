import { Component, OnInit, OnDestroy, ViewEncapsulation, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

import { User } from '../user';
import { Table } from '../table';
import { Game } from './../game';
import { GameService } from './../game.service';
import { TableService } from '../table.service';
import { UserService } from '../user.service';
import { UserTableService } from '../user-table.service';
import { DataHelperService } from '../helpers/data-helper.service';
import { RemoteFormError } from '../remoteFormError';
import { HelperService } from '../helper.service';


@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TableListComponent implements OnInit, OnDestroy {

  private currentUser: User;
  private tables: Table[];
  private games: Game[];
  private subs: Subscription[];
  // private loadingFinished: boolean;
  private helperService: HelperService;
  private tableCreateForm: FormGroup;
  private gameId: FormControl;
  private tableName: FormControl;

  constructor(private tableService: TableService,
    private userTableService: UserTableService,
    private userService: UserService,
    private gameService: GameService,
    private dataHelperService: DataHelperService,
    private fb: FormBuilder,
    private router: Router) {

    this.currentUser = this.userService.currentUser;
    this.games = [];
  }

  createForm() {
    this.tableCreateForm = this.fb.group({
      gameId: ['1', [
        Validators.required
      ]], // <--- the FormControl called "name"
      tableName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]]
    });
    Object.defineProperty(TableListComponent.prototype, 'gameId', { get: () => this.tableCreateForm.get('gameId') });
    Object.defineProperty(TableListComponent.prototype, 'tableName', { get: () => this.tableCreateForm.get('tableName') });
  }

  ngOnInit() {
    this.subs = [];
    this.createForm();

    // const sub = this.tableService.searchResources({ state: '0' }).subscribe(tablesList =>
    const sub = this.tableService.getMany().subscribe(tablesList =>
      this.tables = tablesList);

    this.subs.push(sub);

    const sub2 = this.gameService.getMany().subscribe(games => {
      this.games = games;
    },
      e => {
        console.log(e);
      });

    this.subs.push(sub2);
  }

  get formValid(): boolean {
    return !(this.gameId.errors || this.tableName.errors);
  }

  handleRemoteFormError(e) {

    if (!(e instanceof RemoteFormError)) {
      console.log(e);
      return;
    }

    console.log(e.field, e.type);

    if (e.field === 'gameId') {
      this.tableName.setErrors({});
      this.tableName.updateValueAndValidity();
      switch (e.type) {
        case 'notfound':
          this.gameId.setErrors({ 'notfound': true });
          break;
        case 'ambiguous':
          this.gameId.setErrors({ 'ambiguous': true });
          break;
      }

    } else if (e.field === 'tableName') {
      this.gameId.setErrors({});
      this.gameId.updateValueAndValidity();
      switch (e.type) {
        case 'duplicate':
          this.tableName.setErrors({ 'duplicate': true });
          break;
      }
    }
  }

  onSubmit(): void {

    let tableId;

    const sub = this.dataHelperService.ensureGameExistence(this.gameId.value)
      .flatMap(_ => this.tableService.createTable(this.gameId.value,
        this.tableName.value,
        this.currentUser.values.id))
      .flatMap(table => {
        tableId = table.values.id;
        return this.dataHelperService.joinTable({
          tableId,
          userId: this.currentUser.values.id
        });
      })
      .subscribe(_ => { this.router.navigate(['/table/' + tableId]); },
      e => this.handleRemoteFormError(e));
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
