import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private authService: AuthService,) { }

  currentYear = new Date().getFullYear();
  appName = environment.APP_NAME
  isAuthenticated: boolean = false
  subscription_1!: Subscription 

  //Проверяем авторизован ли пользователь
  checkAuthenticated(){
    this.subscription_1 = this.authService.authenticationState.subscribe(
      ((res: boolean) => {
         this.isAuthenticated = res;
      })
    );
  }

  ngOnInit() {
    this.checkAuthenticated()
  }

  ngOnDestroy(){
    this.subscription_1.unsubscribe()
  }

}
