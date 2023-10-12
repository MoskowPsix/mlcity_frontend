import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {

  eventCount: any
  sightCount: any

  constructor(
    private router: Router, 
    private filterService: FilterService,
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
    //this.checkAuthenticated()
  }

  ngOnDestroy(){
    //this.subscription_1.unsubscribe()
  }

}
