import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from '../../services/token.service';
import { LoadingService } from 'src/app/services/loading.service';
import { environment } from 'src/environments/environment';
import { MessagesAuth } from 'src/app/enums/messages-auth';
import { MessagesErrors } from 'src/app/enums/messages-errors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService, ToastService]
})
export class LoginComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>()

  vkontakteAuthUrl: string = environment.vkontakteAuthUrl
  user_id!: number 
  loginForm!: FormGroup
  responseData: any
  iconState: boolean = true;

  
  constructor(
    private authService: AuthService, 
    private loadingService: LoadingService, 
    private toastService: ToastService, 
    private tokenService: TokenService, 
    private userService: UserService,
    private route: ActivatedRoute, 
    private router: Router,  
  ){}

  onSubmitLogin(){
    this.loginForm.disable()
    this.loadingService.showLoading()
    this.authService.login(this.loginForm.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.positiveResponseAfterLogin(data)
      },
      error: err => {
        this.errorResponseAfterLogin(err)
      }
    });
  }



  loginAfterSocial(user_id: number){
    if (user_id > 0){
      this.loginForm.disable()
      this.loadingService.showLoading()
      this.userService.getUserById(user_id).pipe(takeUntil(this.destroy$)).subscribe({
        next: data => {
          this.positiveResponseAfterLogin(data)
        },
        error: err => {
          this.errorResponseAfterLogin(err)
        }
      });
    }
  }

  onLoading(){
    this.loadingService.showLoading()
    
  }
    
  positiveResponseAfterLogin(data:any){
    this.responseData = data
    this.userService.setUser(this.responseData.user) 
    this.tokenService.setToken(this.responseData.access_token) 
    this.loadingService.hideLoading()
    this.toastService.showToast(MessagesAuth.login, 'success')
    this.loginForm.reset()
    this.loginForm.enable()
    this.router.navigate(['cabinet']);
  }

  errorResponseAfterLogin(err:any){
    this.loadingService.hideLoading()
    this.toastService.showToast(err.error.message || MessagesErrors.default, 'warning')
    this.loginForm.enable()
  }

  MailOrPhone() {
    let loginValue:string = this.loginForm.value.email;
    let loginValueArr:string[] = loginValue.split('');


    for(let i:number = 0; i < loginValue.length; i++){
      if(loginValueArr[i]=='@'){
        this.iconState = false;
        break;
      }else{
        this.iconState = true;

      }
      
    }
  }

  ngOnInit() {

    //Создаем поля для формы
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });

    //Получаем ид юзера и параметра маршрута
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => { 
      this.user_id = params['user_id']; 
    }); 


    this.loginAfterSocial(this.user_id)
    this.MailOrPhone();
  }

  ngOnDestroy() {
     // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }






}