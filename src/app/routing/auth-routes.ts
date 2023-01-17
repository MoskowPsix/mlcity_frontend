
import { Routes } from '@angular/router';
import { LoginComponent } from '../views/login/login.component';
import { RegisterComponent } from '../views/register/register.component';

export const authRoutes: Routes = [ 
    {
      path: 'login',
      component: LoginComponent
    },
    {
      path: 'register',
      component: RegisterComponent
    },
  ];