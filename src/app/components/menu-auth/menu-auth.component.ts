import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import menuAuthData from '../../../assets/json/menu-auth.json'
import { IMenu } from 'src/app/models/menu'
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu-auth',
  templateUrl: './menu-auth.component.html',
  styleUrls: ['./menu-auth.component.scss'],
})

export class MenuAuthComponent implements OnInit {
  menuAuth: IMenu[] = []
  isAuthenticated: boolean = false
  subscriptions: Subscription[] = []
  subscription_1!: Subscription 
  subscription_2!: Subscription
  user: any

  constructor(private authService: AuthService, private userService: UserService) { }

  //Проверяем авторизован ли пользователь
  checkAuthenticated(){
    this.subscription_1 = this.authService.authenticationState.subscribe(
      ((res: boolean) => {
         this.isAuthenticated = res;
      })
    );
  }

  getUser(){
    this.subscription_2 =  this.userService.user.subscribe((user) => {
      this.user = user
    })
  }

  ngOnInit() {
    this.checkAuthenticated()
    this.getUser()
    this.menuAuth = menuAuthData

    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    if (this.subscriptions) {
      this.subscriptions.forEach((subscription) => {
        if (subscription){
          subscription.unsubscribe()
        }      
      })
     }  
  }

}
