import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { TableListComponent } from './table-list/table-list.component';
import { TableComponent } from './table/table.component';
import { AppComponent } from './app.component';


const routes: Routes = [
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: UserDetailComponent },
  { path: 'lobby', component: TableListComponent },
  { path: 'table/:id', component: TableComponent },
  { path: 'users', component: UsersComponent }
];

@NgModule({

  imports: [RouterModule.forRoot(routes)],

  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
