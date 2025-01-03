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
import { NoPathComponent } from '../views/no-path/no-path.component'
import { PrivacyComponent } from '../views/privacy/privacy.component'
import { RecoveryPasswordComponent } from '../views/recovery-password/recovery-password.component'
import { EmailConfirmComponent } from '../views/cabinet/email-confirm/email-confirm.component'
import { OrganizationShowComponent } from '../views/organization-show/organization-show.component'
import { PoliticsDocumentComponent } from '../views/politics-document/politics-document.component'
import { EventsForSearchComponent } from '../views/events/events-for-search/events-for-search.component'
import { SightForSearchComponent } from '../views/sights/sight-for-search/sight-for-search.component'
export const publicRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'email-confirm',
    component: EmailConfirmComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'politics',
    component: PoliticsDocumentComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: '',
    component: NoPathComponent,
    pathMatch: 'full',
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'events',
    component: EventsComponent,
    canActivate: [CheckAuthCanActiveGuard],
  },
  {
    path: 'recovery/:code',
    component: RecoveryPasswordComponent,
  },
  {
    path: 'events/search/:text',
    // pathMatch: 'full',
    component: EventsForSearchComponent,
  },
  {
    path: 'sights/search/:text',
    // pathMatch: 'full',
    component: SightForSearchComponent,
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
    path: 'organizations/:id',
    component: OrganizationShowComponent,
    canActivate: [CheckAuthCanActiveGuard],
    children: [
      {
        path: ':name',
        component: OrganizationShowComponent,
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
