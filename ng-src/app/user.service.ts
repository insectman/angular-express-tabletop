import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { DataService } from './data.service';
import { MessageService } from './message.service';
import { User } from './user';
import { IStringStringMap, HelperService } from './helper.service';
import { RemoteFormError } from './remoteFormError';


@Injectable()
export class UserService extends DataService {

  public currentUser: User;
  public isLoggedIn: boolean;

  constructor(
    http: HttpClient,
    messageService: MessageService,
    helperService: HelperService
  ) {
    super(http, messageService, helperService);
    this.dataUrl = 'api/users';
    this.resourceClass = User;
    this.isLoggedIn = false;
  }

  getOne(id: string): Observable<User> {
    return super.getOne.call(this, id);
  }

  addOne(dataMap: IStringStringMap): Observable<User> {
    return super.addOne.call(this, dataMap);
  }

  searchByIds(ids: string[]): Observable<User[]> {
    // console.log(ids);
    return super.searchByIds.call(this, ids);
  }

  // TODO: replace id with token
  public authenticateByTokenAttempt(id: string): Observable<User> {
    // console.log(id);
    return this.getOne(id).map(resource => {
      if (resource) {
        this.isLoggedIn = true;
        this.currentUser = new User(resource.values);
        return this.currentUser;
      }
    });
  }


  public logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
  }


  public loginAttempt(login: string, password: string): Observable<User> {
    {
      this.dataUrl = 'login';
      return this.searchResources({
        'login': login
      }).
        map(resources => {
          if (resources.length === 1) {
            if (resources[0].values.password !== password) {
              throw new RemoteFormError('Invalid Password', 'password', 'mismatch');
            } else {
              this.currentUser = new User(resources[0].values);
              this.isLoggedIn = true;
              return this.currentUser;
            }
          } else if (resources.length === 0) {
            throw new RemoteFormError('User not found', 'login', 'notfound');
          } else {
            throw new RemoteFormError('Ambigous user credentials', 'login', 'ambiguous');
          }
        });
    }

  }

}

