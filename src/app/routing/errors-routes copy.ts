import { Routes } from '@angular/router'
import { CheckAuthCanActiveGuard } from '../guards/check-auth.can-active.guard'
import { ForbiddenComponent } from '../views/errors/forbidden/forbidden.component'
import { NotFoundComponent } from '../views/errors/not-found/not-found.component'
import { ServerErrorComponent } from '../views/errors/server-error/server-error.component'

export const errorsRoutes: Routes = [
  {
    path: 'forbidden',
    component: ForbiddenComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'server-error',
    component: ServerErrorComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: '**',
    component: NotFoundComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
]
