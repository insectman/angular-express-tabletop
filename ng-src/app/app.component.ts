import { Router } from '@angular/router';
import { Component, OnInit, EventEmitter, ViewChild, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/finally';

import { UserLoginComponent } from './user-login/user-login.component';
import { User } from './user';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {

  title = 'JDTT';
  private loadingFinished: boolean;
  private subs: Subscription[];
  private currentUser: User;

  @ViewChild(UserLoginComponent) userLoginComponent: UserLoginComponent;

  // TODO: replace id with token
  onUserLogin(user: User) {
    console.log(user, user.values.id);
    this.currentUser = user;
    localStorage.setItem('userId', '' + user.values.id);
  }

  public logout() {
    localStorage.setItem('userId', null);
    this.userService.logout();
    this.router.navigate(['']);
  }

  constructor(private userService: UserService, private router: Router) {
    this.loadingFinished = false;
  }

  // TODO: replace id with token
  ngOnInit(): void {
    this.subs = [];
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return;
    }
    this.subs.push(this.userService.authenticateByTokenAttempt(userId)
      .finally(() => this.loadingFinished = true)
      .subscribe(user => {
        this.currentUser = user;
      },
      e => {
        console.log(e);
      }));
  }

  ngAfterViewInit() {

    this.subs.push(this.userLoginComponent.onUserLogin.subscribe(user => {
      this.onUserLogin(user);
    }));

  }

  ngOnDestroy() {
    console.log(this.subs);
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
