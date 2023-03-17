
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { CabinetComponent } from "../views/cabinet/cabinet.component";
import { EventsComponent } from '../views/events/events.component';
import { EventCreateComponent } from '../views/events/event-create/event-create.component';
import { EventShowComponent } from '../views/events/event-show/event-show.component';
import { SightsComponent } from '../views/cabinet/sights/sights.component';
import { SightCreateComponent } from '../views/cabinet/sights/sight-create/sight-create.component';
import { SightShowComponent } from '../views/cabinet/sights/sight-show/sight-show.component';
import { FavoritesComponent } from '../views/cabinet/favorites/favorites.component';
import { NotificationsComponent } from '../views/cabinet/notifications/notifications.component';
import { SettingsComponent } from '../views/cabinet/settings/settings.component';

export const privateRoutes: Routes = [ 
    {
      path: 'cabinet',
      component: CabinetComponent,
      canActivate: [AuthGuard],
    },
      // children: [
    {
      path: 'cabinet/favorites',
      component: FavoritesComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/notifications',
      component: NotificationsComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/settings',
      component: SettingsComponent,
      canActivate: [AuthGuard],
      // children: [
    },
    {
      path: 'cabinet/settings/profile',
      component: SettingsComponent ,//Компонент юзер
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/settings/notifications',
      component: SettingsComponent, //Компонент уведомления
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/settings/favorites',
      component: SettingsComponent, //Компонент избранное
      canActivate: [AuthGuard],
    },
    //   ]
    // },
    {
      path: 'cabinet/events',
      component: EventsComponent,
      canActivate: [AuthGuard],
      // children: [
      //   {
      //     path: 'cabinet/events/:id',
      //     component: EventShowComponent,
      //   },
      //   {
      //     path: 'cabinet/events/create',
      //     component: EventCreateComponent, 
      //   },
      // ]
    },
    {
      path: 'cabinet/events/:id/view',
      component: EventShowComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/events/create',
      component: EventCreateComponent, 
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/sights',
      component: SightsComponent,
      canActivate: [AuthGuard],
      // children: [
      //   {
      //     path: 'cabinet/sights/:id',
      //     component: SightShowComponent,
      //   },
      //   {
      //     path: 'cabinet/sights/create',
      //     component: SightCreateComponent,
      //   },
      // ]
    },
    {
      path: 'cabinet/sights/:id/view',
      component: SightShowComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'cabinet/sights/create',
      component: SightCreateComponent,
      canActivate: [AuthGuard],
    },
      // ]
    // },
  ];