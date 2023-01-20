import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from '../../services/token.service';

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

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email,]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  
  constructor(
    private authService: AuthService, 
    private toastService: ToastService, 
    private tokenService: TokenService, 
    private userService: UserService,
    private route: ActivatedRoute, 
    private router: Router,

  ){}

  onSubmitLogin(){
    this.subscription_1 = this.authService.login(this.loginForm.value as User).subscribe({
      next: data => {
        console.log(data)
        this.userService.setUser(data) // НЕРАБОАТЕТ
        this.tokenService.setToken(data) // НЕРАБОАТЕТ
        this.toastService.showToast('Вы успешно авторизовались!', 'success')
        // TokenService.getToken()
      },
      error: err => {
        console.log(err.error.message);
        this.toastService.showToast(err.error.message, 'warning')
      }
    });
  }

  redirectToCabinet(user_id: number){
    if (user_id > 0){
      this.userService.setUserById(user_id)
      this.router.navigate(['cabinet']);
    }
  }
    

  ngOnInit() {
    //Получаем ид юзера и параметра маршрута
    this.subscription_2 = this.route.paramMap.pipe(
      switchMap(params => params.getAll('user_id'))
    ).subscribe(data => this.user_id = +data)

    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)

    this.redirectToCabinet(this.user_id)
    console.log(this.user_id)
  }

  ngOnDestroy() {
     // отписываемся от всех подписок
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }

}