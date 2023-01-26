import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { LoginComponent } from '../views/login/login.component';
import { LoggedInAuthGuard } from "../guards/logged-in-auth.guard";

export const authRoutes: Routes = [ 
    {
      path: 'login',
       component: LoginComponent, 
      canActivate: [LoggedInAuthGuard],
    },
    {
      path: 'login/:user_id',
      component: LoginComponent, 
      canActivate: [LoggedInAuthGuard],
    },
  ];