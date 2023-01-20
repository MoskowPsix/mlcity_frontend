
import { Routes } from '@angular/router';
import { LoginComponent } from '../views/login/login.component';
import { RegisterComponent } from '../views/register/register.component';

export const authRoutes: Routes = [ 
    {
      path: 'login',
      // component: LoginComponent
      redirectTo: 'login/', 
      pathMatch: 'full'
    },
    { path: 'login/:user_id',  //user_id ужен после редиректа с соц.сети и последующей обработки
      component: LoginComponent 
    },
    {
      path: 'register',
      component: RegisterComponent
    },
  ];