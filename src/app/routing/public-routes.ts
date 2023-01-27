import { EventsComponent } from "../views/events/events.component";
import { HomeComponent } from "../views/home/home.component";
import { AddEventComponent } from '../views/add-event/add-event.component';
import { Routes } from '@angular/router';
import { AboutComponent } from "../views/about/about.component";
import { ContactsComponent } from "../views/contacts/contacts.component";
import { FeedbackComponent } from "../views/feedback/feedback.component";
import { SupportComponent } from "../views/support/support.component";

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
      component: AboutComponent
    },
    {
      path: 'contacts',
      component: ContactsComponent,
      children:[
        {
          path: 'feedback',
          component: FeedbackComponent
        },
        {
          path: 'support',
          component: SupportComponent
        }
      ]
    },
    
  ];