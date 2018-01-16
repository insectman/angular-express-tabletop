import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { UserService } from '../user.service';
import { User } from '../user';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, OnDestroy {

  @Input() user: User;
  private subs: Subscription[];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.subs = [];
    this.getOne();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  getOne(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.subs.push(this.userService.getOne(id)
      .subscribe(user => this.user = user));
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    /*
    this.subs.push(this.userService.updateOne(this.user)
      .subscribe(() => this.goBack()));
      */
  }

}
