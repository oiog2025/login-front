import {Routes} from '@angular/router';
import {LoginComponent} from './user-management/presentation/login/login.component';
import {RegisterComponent} from './user-management/presentation/register/register.component';
import {UserListComponent} from './user-management/presentation/user-list/user-list.component';
import {authGuard} from './user-management/infrastructure/auth.guard';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent,},
  {path: 'register', component: RegisterComponent},
  // 🔐 RUTA PROTEGIDA: Si intentan escribir /users sin token, el guard los sacará volando
  {path: 'users', component: UserListComponent, canActivate: [authGuard]}
];
