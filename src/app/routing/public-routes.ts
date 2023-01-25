import { EventsComponent } from "../views/events/events.component";
import { HomeComponent } from "../views/home/home.component";
import { AddEventComponent } from '../views/add-event/add-event.component';
import { Routes } from '@angular/router';

export const publicRoutes: Routes = [ 
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'events',
      component: EventsComponent
    },
    {
      path: 'add_event',
      component: AddEventComponent
    },
    {
      path: 'about',
      component: HomeComponent
    },
    {
      path: 'contacts',
      component: HomeComponent,
      children:[
        {
          path: 'feedback',
          component: HomeComponent
        },
        {
          path: 'support',
          component: HomeComponent
        }
      ]
    },
    
  ];