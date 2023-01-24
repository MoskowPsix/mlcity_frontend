import { isPlatform } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false
  subscription_1!: Subscription 

  constructor(private authService: AuthService) { }

  //Проверяем авторизован ли пользователь
  checkAuthenticated(){
    this.subscription_1 = this.authService.authenticationState.subscribe(
      ((res: boolean) => {
          console.log('authenticationState = ' + res);
          this.isAuthenticated = res;
          console.log('this.isAuthenticated = ' + this.isAuthenticated);
      })
    );
  }

  ngOnInit() {
    this.checkAuthenticated() 
    // this.isAuthenticated = this.authService.isAuthenticated()
    // this.subscription_1 = this.authService.isAuthenticated().subscribe((state: boolean) => this.isAuthenticated = state);
  }

  ngOnDestroy() {
    if (this.subscription_1){
      this.subscription_1.unsubscribe();
    }  
  }
}
