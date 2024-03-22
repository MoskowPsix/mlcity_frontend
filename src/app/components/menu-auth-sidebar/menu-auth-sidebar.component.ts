import { Component, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import menuAuthData from '../../../assets/json/menu-auth.json'
import { IMenu } from 'src/app/models/menu'
import { AuthService } from 'src/app/services/auth.service'
import { UserService } from 'src/app/services/user.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-menu-auth-sidebar',
  templateUrl: './menu-auth-sidebar.component.html',
  styleUrls: ['./menu-auth-sidebar.component.scss'],
})
export class MenuAuthSidebarComponent implements OnInit {
  menuAuth: IMenu[] = []
  isAuthenticated: boolean = false
  subscriptions: Subscription[] = []
  subscription_1!: Subscription
  subscription_2!: Subscription
  user: any

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {}

  //Проверяем авторизован ли пользователь
  checkAuthenticated() {
    this.subscription_1 = this.authService.authenticationState.subscribe(
      (res: boolean) => {
        this.isAuthenticated = res
      },
    )
  }

  getUser() {
    this.subscription_2 = this.userService.getUser().subscribe((user) => {
      this.user = user
    })
  }

  public isLChildLinkActive(route: string): boolean {
    return this.router.isActive(route, true)
  }

  ngOnInit() {
    this.checkAuthenticated()
    this.getUser()
    this.menuAuth = menuAuthData

    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    // отписываемся от всех подписок
    if (this.subscriptions) {
      this.subscriptions.forEach((subscription) => {
        if (subscription) {
          subscription.unsubscribe()
        }
      })
    }
  }
}
