import { Injectable, inject } from '@angular/core'
import { UserService } from '../services/user.service'
import { EventsService } from '../services/events.service'
import { SightsService } from '../services/sights.service'
import { ActivatedRoute } from '@angular/router'
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
  userService:UserService = inject(UserService)
  eventsService:EventsService = inject(EventsService)
  sightsService:SightsService = inject(SightsService)
  router:Router = inject(Router)
  activatedRoute:ActivatedRoute = inject(ActivatedRoute)
  url!:string

  userId!:number
  editObjectId!:number
  getUserId(){
    this.userService.getUser().pipe(takeUntil((this.destroy$))).subscribe((res:any)=>{
      this.userId = res.id
    })
  }
  checkRouter(){
    this.url = this.router.url
    if (this.url.includes('/cabinet/sights/edit')) {
      this.url = '/cabinet/sights/edit'
    }
    if (this.url.includes('/cabinet/events/edit')) {
      this.url = '/cabinet/events/edit'
    }
  }

  getEditObjectId(){
    console.log(this.router.url)
      if(this.url && this.url == '/cabinet/sights/edit'){
        let sightId = this.activatedRoute.snapshot.paramMap.get('id')!
        this.sightsService.getSightById(Number(sightId)).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
          console.log(res)
        })
      }
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      this.getUserId()
      this.checkRouter()
      this.getEditObjectId()
    if (true) {
      return true
    } else {

      return false
    }
  }
}