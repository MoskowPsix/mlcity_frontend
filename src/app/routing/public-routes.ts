import { SightsComponent } from '../views/sights/sights.component'
import { EventsComponent } from '../views/events/events.component'
import { HomeComponent } from '../views/home/HomeComponent'
import { AddEventComponent } from '../views/add-event/add-event.component'
import { Routes } from '@angular/router'
import { AboutComponent } from '../views/about/about.component'
import { ContactsComponent } from '../views/contacts/contacts.component'
import { FeedbackComponent } from '../views/feedback/feedback.component'
import { SupportComponent } from '../views/support/support.component'
import { CheckAuthCanActiveGuard } from '../guards/check-auth.can-active.guard'
import { EventShowComponent } from '../views/events/event-show/event-show.component'
import { SightShowComponent } from '../views/sights/sight-show/sight-show.component'
import { FiltersNotButtonComponent } from '../components/filters_not_button/filters_not_button.component'
import { CalendulaComponent } from '../components/calendula/calendula.component'
import { NoPathComponent } from '../views/no-path/no-path.component'

export const publicRoutes: Routes = [
  {
    path: 'test',
    component: CalendulaComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: '',
    component: NoPathComponent,
    pathMatch: 'full',
  },
  {
    path: 'events',
    component: EventsComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'events/:id',
    // pathMatch: 'full',
    component: EventShowComponent,
    canActivate: [CheckAuthCanActiveGuard],
    children: [
      {
        path: ':name',
        component: EventShowComponent,
      },
    ],
  },
  {
    path: 'add_event',
    component: AddEventComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'sights',
    component: SightsComponent, // Поменять на компонет места
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'sights/:id',
    // pathMatch: 'full',
    component: SightShowComponent, // Поменять на компонет места
    canActivate: [CheckAuthCanActiveGuard],
    children: [
      {
        path: ':name',
        component: SightShowComponent,
      },
    ],
  },
  {
    path: 'add_sight',
    component: AddEventComponent, // Поменять на компонет места
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
    children: [
      {
        path: 'feedback',
        component: FeedbackComponent,
      },
      {
        path: 'support',
        component: SupportComponent,
      },
    ],
  },
]
