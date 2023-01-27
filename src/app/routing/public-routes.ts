import { EventsComponent } from "../views/events/events.component";
import { HomeComponent } from "../views/home/home.component";
import { AddEventComponent } from '../views/add-event/add-event.component';
import { Routes } from '@angular/router';
import { AboutComponent } from "../views/about/about.component";
import { ContactsComponent } from "../views/contacts/contacts.component";
import { FeedbackComponent } from "../views/feedback/feedback.component";
import { SupportComponent } from "../views/support/support.component";
import { CheckAuthCanActiveGuard } from "../guards/check-auth.can-active.guard";

export const publicRoutes: Routes = [ 
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [CheckAuthCanActiveGuard],
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'events',
      component: EventsComponent,
      canActivate: [CheckAuthCanActiveGuard],
    },
    {
      path: 'add_event',
      component: AddEventComponent,
      canActivate: [CheckAuthCanActiveGuard],
    },
    {
      path: 'about',
      component: AboutComponent,
      canActivate: [CheckAuthCanActiveGuard],
    },
    {
      path: 'contacts',
      component: ContactsComponent,
      canActivate: [CheckAuthCanActiveGuard],
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