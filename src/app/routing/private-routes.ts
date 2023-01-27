
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { CabinetComponent } from "../views/cabinet/cabinet.component";
import { EventsComponent } from '../views/cabinet/events/events.component';
import { FavoritesComponent } from '../views/cabinet/favorites/favorites.component';
import { NotificationsComponent } from '../views/cabinet/notifications/notifications.component';
import { SettingsComponent } from '../views/cabinet/settings/settings.component';

export const privateRoutes: Routes = [ 
    {
      path: 'cabinet',
      component: CabinetComponent,
      canActivate: [AuthGuard],
      children: [
        {
          path: 'favorites',
          component: FavoritesComponent,
        },
        {
          path: 'notifications',
          component: NotificationsComponent,
        },
        {
          path: 'settings',
          component: SettingsComponent,
          children: [
            {
              path: 'profile',
              component: SettingsComponent ,//Компонент юзер
            },
            {
              path: 'notifications',
              component: CabinetComponent, //Компонент уведомления
            },
            {
              path: 'favorites',
              component: CabinetComponent, //Компонент избранное
            },
          ]
        },
        {
          path: 'events',
          component: EventsComponent,
          children: [
            {
              path: 'cabinet/events/:id',
              component: EventsComponent,
            },
            {
              path: 'cabinet/events/create',
              component: EventsComponent, // тут поставить компонент форма создания ивента
            },
          ]
        },
      ]
    },
  ];