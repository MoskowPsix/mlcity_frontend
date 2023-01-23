import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from '../../services/token.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService, ToastService]
})
export class LoginComponent implements OnInit, OnDestroy {

  vkontakteAuthkUrl: string = 'http://localhost:8000/api/social-auth/vkontakte'
  user_id!: number 
  subscription_1!: Subscription 
  subscription_2!: Subscription 
  subscriptions: Subscription[] = []
  loginForm!: FormGroup
  responseData: any

  
  constructor(
    private authService: AuthService, 
    private loadingService :LoadingService,
    private toastService: ToastService, 
    private tokenService: TokenService, 
    private userService: UserService,
    private route: ActivatedRoute, 
    private router: Router,  
  ){}

  onSubmitLogin(){
    this.loginForm.disable()
    this.loadingService.showLoading()
    this.subscription_1 = this.authService.login(this.loginForm.value).subscribe({
      next: data => {
        this.responseData = data
        this.userService.setUser(this.responseData.user) 
        this.tokenService.setToken(this.responseData.access_token) 
        this.loadingService.hideLoading()
        this.toastService.showToast('Вы успешно авторизовались!', 'success')
        this.router.navigate(['cabinet']);
      },
      error: err => {
        this.loadingService.hideLoading()
        this.toastService.showToast(err.error.message, 'warning')
        this.loginForm.enable()
      }
    });
  }

  redirectToCabinetAfterSocialLogin(user_id: number){
    if (user_id > 0){
      this.userService.setUserById(user_id)
      this.router.navigate(['cabinet']);
    }
  }
    

  ngOnInit() {
    //Создаем поля для формы
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email,]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });

    //Получаем ид юзера и параметра маршрута
    this.subscription_2 = this.route.paramMap.pipe(
      switchMap(params => params.getAll('user_id'))
    ).subscribe(data => this.user_id = +data)

    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)

    this.redirectToCabinetAfterSocialLogin(this.user_id)
  }

  ngOnDestroy() {
     // отписываемся от всех подписок
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }

}