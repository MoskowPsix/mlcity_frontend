import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {

  eventCount: any
  sightCount: any

  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`

  isAuth: boolean = false
  avatarUrl!: string
  user!: any

  constructor(
    private router: Router,
    private filterService: FilterService,
    private authService: AuthService,
    private userService: UserService
    //private authService: AuthService,
  ) {}

  getEventService() {
    return this.filterService.eventsCount.value
  }

  getSightService() {
    return  this.filterService.sightsCount.value
    }

  getFavoritesService() {
    return this.filterService.favoritesCount.value
  }
  checkAuthenticated(){
    this.authService.authenticationState.subscribe(
      ((res: boolean) => {
         this.isAuth = res;
      })
    );
  }
  getUser(){
    this.userService.getUser().subscribe((user) => {
      this.user =user
      if(user){
        if(user.avatar){
          if(user.avatar.includes("https")){
            this.avatarUrl = user.avatar
          }
          else{
            this.avatarUrl = `${this.backendUrl}${user.avatar}`
          }
        }
      }
    })
  }

  // currentYear = new Date().getFullYear();
  // appName = environment.APP_NAME
  // isAuthenticated: boolean = false
  // subscription_1!: Subscription

  //Проверяем авторизован ли пользователь
  // checkAuthenticated(){
  //   this.subscription_1 = this.authService.authenticationState.subscribe(
  //     ((res: boolean) => {
  //        this.isAuthenticated = res;
  //     })
  //   );
  // }

  ngOnInit() {
    this.getUser()
    this.checkAuthenticated()

  }

  ngOnDestroy(){
    //this.subscription_1.unsubscribe()
  }

}
