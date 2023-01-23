
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { CabinetComponent } from "../views/cabinet/cabinet.component";

export const privateRoutes: Routes = [ 
    {
      path: 'cabinet',
      component: CabinetComponent,
      canActivate: [AuthGuard],
    },
  ];