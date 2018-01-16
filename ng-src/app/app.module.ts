import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppRoutingModule } from './/app-routing.module';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessagesComponent } from './messages/messages.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { TableListComponent } from './table-list/table-list.component';
import { TableComponent } from './table/table.component';
import { UserService } from './user.service';
import { TableService } from './table.service';
import { GameService } from './game.service';
import { UserTableService } from './user-table.service';
import { MessageService } from './message.service';
import { HelperService } from './helper.service';
import { InMemoryDataService } from './in-memory-data.service';
import { DataHelperService } from './helpers/data-helper.service';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    DashboardComponent,
    MessagesComponent,
    UserLoginComponent,
    UsersComponent,
    UserDetailComponent,
    UserSearchComponent,
    TableListComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.

    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
        delete404: true,
        post204: false,
        put204: false,
        delay: 0
      }
    )
  ],
  providers: [UserService, MessageService, HelperService, TableService,
    DataHelperService, UserTableService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
