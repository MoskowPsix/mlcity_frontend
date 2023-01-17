import { EventsComponent } from "../views/events/events.component";
import { HomeComponent } from "../views/home/home.component";
import { Routes } from '@angular/router';

export const publicRoutes: Routes = [ 
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: 'events',
      component: EventsComponent
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
  ];