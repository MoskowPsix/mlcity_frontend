import { Routes } from '@angular/router';
import { ForbiddenComponent } from '../views/errors/forbidden/forbidden.component';
import { NotFoundComponent } from '../views/errors/not-found/not-found.component';
import { ServerErrorComponent } from '../views/errors/server-error/server-error.component';

export const errorsRoutes: Routes = [ 
    {
      path: 'forbidden',
      component: ForbiddenComponent
    },
    {
      path: 'server-error',
      component: ServerErrorComponent
    },
    {
      path: '**',
      component: NotFoundComponent
    }
  ];