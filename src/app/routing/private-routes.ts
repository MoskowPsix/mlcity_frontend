import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { CabinetComponent } from '../views/cabinet/cabinet.component';
import { EventsComponent } from '../views/events/events.component';
import { EventCreateComponent } from '../views/events/event-create/event-create.component';
import { EventShowComponent } from '../views/events/event-show/event-show.component';
import { SightsComponent } from '../views/sights/sights.component';
import { SightCreateComponent } from '../views/sights/sight-create/sight-create.component';
import { SightShowComponent } from '../views/sights/sight-show/sight-show.component';
import { FavoritesComponent } from '../views/cabinet/favorites/favorites.component';
import { NotificationsComponent } from '../views/cabinet/notifications/notifications.component';
import { SettingsComponent } from '../views/cabinet/settings/settings.component';
import { SettingsProfileComponent } from '../views/cabinet/settings/settings-profile/settings-profile.component';
import { SettingsPrivacyComponent } from '../views/cabinet/settings/settings-privacy/settings-privacy.component';
import { MyEventsComponent } from '../views/cabinet/my-events/my-events.component';
import { MySightsComponent } from '../views/cabinet/my-sights/my-sights.component';
import { EdditSightComponent } from '../views/cabinet/my-sights/edit-sight/eddit-sight.component';

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
    children: [
      {
        path: 'profile',
        component: SettingsProfileComponent,
      },
      {
        path: 'privacy',
        component: SettingsPrivacyComponent,
      },
    ],
    canActivate: [AuthGuard],
    // children: [
  },
  // {
  //   path: 'cabinet/settings/profile',
  //   component: SettingsProfileComponent ,//Компонент юзер
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'cabinet/settings/notifications',
  //   component: SettingsComponent, //Компонент уведомления
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'cabinet/settings/favorites',
  //   component: SettingsComponent, //Компонент избранное
  //   canActivate: [AuthGuard],
  // },
  //   ]
  // },
  {
    path: 'cabinet/events',
    component: MyEventsComponent,
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
    path: 'cabinet/sights/:id/view',
    component: SightShowComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cabinet/events/create',
    component: EventCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cabinet/sights/:id/edit',
    component: EdditSightComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cabinet/sights',
    component: MySightsComponent,
    canActivate: [AuthGuard],
    children: [
      // {
      //   path: 'cabinet/sights/:id',
      //   component: SightShowComponent,
      // },
      // {
      //   path: 'cabinet/sights/create',
      //   component: SightCreateComponent,
      // },
      // {
      //   path: ':id/edit',
      //   component: EdditSightComponent,
      // },
    ],
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
