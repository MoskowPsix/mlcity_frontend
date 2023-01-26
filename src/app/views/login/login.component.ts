import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from '../../services/token.service';
import { LoadingService } from 'src/app/services/loading.service';
import { environment } from 'src/environments/environment';
import { MessagesAuth } from 'src/app/enums/messages-auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService, ToastService]
})
export class LoginComponent implements OnInit, OnDestroy {

  vkontakteAuthUrl: string = environment.vkontakteAuthUrl
  user_id!: number 
  subscription_1!: Subscription 
  subscription_2!: Subscription 
  subscription_3!: Subscription 
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
        this.positiveRsponseAfterLogin(data)
      },
      error: err => {
        this.errorRsponseAfterLogin(err)
      }
    });
  }

  loginAfterSocial(user_id: number){
    if (user_id > 0){
      this.loginForm.disable()
      this.loadingService.showLoading()
      this.subscription_3 = this.userService.getUserById(user_id).subscribe({
        next: data => {
          this.positiveRsponseAfterLogin(data)
        },
        error: err => {
          this.errorRsponseAfterLogin(err)
        }
      });
    }
  }

  onLoading(){
    this.loadingService.showLoading()
  }
    
  positiveRsponseAfterLogin(data:any){
    this.responseData = data
    this.userService.setUser(this.responseData.user) 
    this.tokenService.setToken(this.responseData.access_token) 
    this.loadingService.hideLoading()
    this.toastService.showToast(MessagesAuth.login, 'success')
    this.router.navigate(['cabinet']);
  }

  errorRsponseAfterLogin(err:any){
    this.loadingService.hideLoading()
    this.toastService.showToast(err.error.message, 'warning')
    this.loginForm.enable()
  }

  ngOnInit() {
    //Создаем поля для формы
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email,]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });

    //Получаем ид юзера и параметра маршрута
    this.subscription_2 = this.route.params.subscribe(params => { 
      this.user_id = params['user_id']; 
    }); 

    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)
    this.subscriptions.push(this.subscription_3)

    this.loginAfterSocial(this.user_id)
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