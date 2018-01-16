import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[];
  private subs: Subscription[];

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.subs = [];
    this.getMany();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  /*
  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.userService.addOne({ name } as User)
      .subscribe(user => {
        this.users.push(user);
      });
  }
  */

  getMany(): void {
    /*this.subs.push(this.userService.getMany()
      .subscribe(users => this.users = users));*/
  }

  /*
  delete(user: User): void {
    this.users = this.users.filter(h => h !== user);
    this.subs.push(this.userService.deleteOne(user).subscribe());
  }
  */

}
