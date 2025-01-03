import { Routes } from '@angular/router'
import { AuthGuard } from '../guards/auth.guard'
import { CabinetComponent } from '../views/cabinet/cabinet.component'
import { EventsComponent } from '../views/events/events.component'
import { EventCreateComponent } from '../views/events/event-create/event-create.component'
import { EventShowComponent } from '../views/events/event-show/event-show.component'
import { SightsComponent } from '../views/sights/sights.component'
import { SightCreateComponent } from '../views/sights/sight-create/sight-create.component'
import { SightShowComponent } from '../views/sights/sight-show/sight-show.component'
import { FavoritesComponent } from '../views/cabinet/favorites/favorites.component'
import { NotificationsComponent } from '../views/cabinet/notifications/notifications.component'
import { SettingsComponent } from '../views/cabinet/settings/settings.component'
import { SettingsProfileComponent } from '../views/cabinet/settings/settings-profile/settings-profile.component'
import { SettingsPrivacyComponent } from '../views/cabinet/settings/settings-privacy/settings-privacy.component'
import { MyEventsComponent } from '../views/cabinet/my-events/my-events.component'
import { MySightsComponent } from '../views/cabinet/my-sights/my-sights.component'
import { EditSightComponent } from '../views/cabinet/edit/edit-sight/edit-sight.component'
import { EditEventComponent } from '../views/cabinet/edit/edit-event/edit-event.component'
import { EmailConfirmGuard } from '../guards/confirm-email.guard'
import { OrganizationCreateComponent } from '../views/cabinet/organization/create/organization-create/organization-create.component'
import { checkEditForAuthorGuard } from '../guards/check-edit-for-author.guard'
import { MyLocationPage } from '../views/cabinet/my-location/my-location.page'

export const privateRoutes: Routes = [
  {
    path: 'cabinet',
    component: CabinetComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cabinet/organizations/create',
    component: OrganizationCreateComponent,
    canActivate: [AuthGuard, EmailConfirmGuard],
  },
  // children: [
  {
    path: 'cabinet/favorites',
    component: FavoritesComponent,
  },
  {
    path: 'cabinet/notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cabinet/location',
    loadChildren: () => import('../views/cabinet/my-location/my-location.module').then((m) => m.MyLocationPageModule),
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
    canActivate: [AuthGuard, EmailConfirmGuard],
  },
  {
    path: 'cabinet/sights/edit/:id',
    component: EditSightComponent,
    canActivate: [AuthGuard, checkEditForAuthorGuard, EmailConfirmGuard],
  },
  {
    path: 'cabinet/events/edit/:id',
    component: EditEventComponent,
    canActivate: [AuthGuard, checkEditForAuthorGuard, EmailConfirmGuard],
  },
  {
    path: 'cabinet/sights',
    component: MySightsComponent,
    canActivate: [AuthGuard, EmailConfirmGuard],
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
    canActivate: [AuthGuard, EmailConfirmGuard],
  },
  // ]
  // },
]
