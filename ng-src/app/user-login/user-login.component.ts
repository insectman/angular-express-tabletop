import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { User } from '../user';
import { UserService } from '../user.service';
import { HelperService } from '../helper.service';
import { RemoteFormError } from '../remoteFormError';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css'],
  // outputs: ['onUserLogin']
})
export class UserLoginComponent implements OnInit, OnDestroy {

  private loginForm: FormGroup;
  private login;
  private password;
  private subs: Subscription[];

  @Output()
  public onUserLogin = new EventEmitter<User>();

  constructor(private userService: UserService, private helperService: HelperService, private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      login: ['', [
        Validators.required,
        Validators.minLength(2)
      ]], // <--- the FormControl called "name"
      password: ['', [
        Validators.required,
        Validators.minLength(2)
      ]]
    });
    Object.defineProperty(UserLoginComponent.prototype, 'login', { get: () => this.loginForm.get('login') });
    Object.defineProperty(UserLoginComponent.prototype, 'password', { get: () => this.loginForm.get('password') });
  }

  userInputsInValid(): boolean {
    // this.login.errors && console.log(Object.keys(this.login.errors));
    return this.login.pristine || this.password.pristine ||
      (this.login.errors && (this.login.errors.required || this.login.errors.minlength)) ||
      (this.password.errors && (this.password.errors.required || this.password.errors.minlength));
  }

  onSubmit(): void {
    this.subs.push(this.userService.loginAttempt(this.login.value, this.password.value)
      .subscribe(user => {
        console.log(user);
        this.onUserLogin.emit(user);
        this.loginForm.reset();
        this.loginForm.markAsPristine();
      },
      e => {
        if (e.field === 'login') {
          this.password.setErrors({});
          this.password.updateValueAndValidity();
          switch (e.type) {
            case 'notfound':
              this.login.setErrors({ 'notfound': true });
              break;
            case 'ambiguous':
              this.login.setErrors({ 'ambiguous': true });
              break;
          }

        } else if (e.field === 'password') {
          this.login.setErrors({});
          this.login.updateValueAndValidity();
          switch (e.type) {
            case 'mismatch':
              this.password.setErrors({ 'mismatch': true });
              break;
          }
        }
        console.log(e.field, e.type);
      }));
  }

  ngOnInit(): void {
    this.subs = [];
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
