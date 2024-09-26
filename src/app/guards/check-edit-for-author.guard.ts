import { Injectable, inject } from '@angular/core'
import { UserService } from '../services/user.service'
import { EventsService } from '../services/events.service'
import { SightsService } from '../services/sights.service'
import { ActivatedRoute } from '@angular/router'
import { ToastService } from '../services/toast.service'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { Observable, Subject, takeUntil } from 'rxjs'
@Injectable({
  providedIn: 'root',
})
export class checkEditForAuthorGuard implements CanActivate {
  private readonly destroy$ = new Subject<void>()
  constructor() {}
  userService: UserService = inject(UserService)
  eventsService: EventsService = inject(EventsService)
  sightsService: SightsService = inject(SightsService)
  activatedRoute: ActivatedRoute = inject(ActivatedRoute)
  toastService: ToastService = inject(ToastService)
  router: Router = inject(Router)
  url!: string

  userId!: number
  editObjectUserId!: number
  getUserId() {
    this.userService
      .getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.userId = res.id
      })
  }
  checkRouter(route: any) {
    this.url = route._routerState.url
    if (this.url.includes('/cabinet/sights/edit')) {
      this.url = '/cabinet/sights/edit'
    }
    if (this.url.includes('/cabinet/events/edit')) {
      this.url = '/cabinet/events/edit'
    }
  }

  getEditObjectId(route: any) {
    if (this.url && this.url == '/cabinet/sights/edit') {
      let sightId = route._routerState.url.split('/')[route._routerState.url.split('/').length - 1]
      this.sightsService
        .getSightById(Number(sightId))
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.editObjectUserId = res.sight.user_id
          if (this.userId != this.editObjectUserId) {
            this.router.navigate(['/home'])
            this.toastService.showToast('Вы не можете редактировать данное сообщество', 'danger')
          }
        })
    } else if (this.url && this.url == '/cabinet/events/edit') {
      let eventId = route._routerState.url.split('/')[route._routerState.url.split('/').length - 1]
      this.eventsService
        .getEventById(Number(eventId))
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.editObjectUserId = res.event.user_id
          if (this.userId != this.editObjectUserId) {
            this.toastService.showToast('Вы не можете редактировать данное событие', 'danger')
            this.router.navigate(['/home'])
          }
        })
    }
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.getUserId()
    this.checkRouter(route)
    this.getEditObjectId(route)
    if (true) {
      return true
    } else {
      return false
    }
  }
}
