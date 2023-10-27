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
import { ActionSheetController } from '@ionic/angular';

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
  formSetPassword!: FormGroup
  responseData: any
  token?: string
  modalPass: boolean = false
  presentingElement: undefined

  
  constructor(
    private authService: AuthService, 
    private loadingService: LoadingService, 
    private toastService: ToastService, 
    private tokenService: TokenService, 
    private userService: UserService,
    private route: ActivatedRoute, 
    private router: Router,  
    private actionSheetCtrl: ActionSheetController,
  ){}


  loginPhone() {
    this.formSetPassword = new FormGroup({
      number: new FormControl('', [Validators.required, Validators.minLength(3),]),
      password_retry: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });
  }
  setPass() {
    this.modalPass = false
    this.loginForm.disable()
    this.loadingService.showLoading()
    this.authService.setPassword(this.formSetPassword.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.formSetPassword.reset()
        this.formSetPassword.enable()
        this.positiveResponseAfterLogin(data)
      },
      error: err => {
        this.formSetPassword.reset()
        this.formSetPassword.enable()
        this.errorResponseAfterLogin(err)
        this.modalPass = true
      }
    });
  }

  canDismiss = async (close: boolean = false) => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Вы действительно хотите выйти и не устанавливать пароль',
      buttons: [
        {
          text: 'Да',
          role: 'confirm',
        },
        {
          text: 'Нет',
          role: 'cancel',
        },
      ],
    });
    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };

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

  loginAfterSocial(token: any){
    if (token.length >= 47){
      this.tokenService.setToken(token)
      this.loginForm.disable()
      this.loadingService.showLoading()
      this.userService.getUserById().pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          let timeZone = new Date().getTimezoneOffset()
          let time = Math.ceil(new Date().getTime() / 100000)
          let created_time = Math.ceil(new Date(data.user.social_account.created_at).getTime() / 100000)
          let now_time = time
          console.log(created_time, now_time)
          if (created_time === now_time) {
            this.modalPass = true
          }
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
    this.loadingService.hideLoading()
    this.toastService.showToast(MessagesAuth.login, 'success')
    this.loginForm.reset()
    this.loginForm.enable()
    if (!this.modalPass) {
      this.router.navigate(['cabinet']);
    }
  }

  errorResponseAfterLogin(err:any){
    this.loadingService.hideLoading()
    this.toastService.showToast(err.error.message || MessagesErrors.default, 'warning')
    this.loginForm.enable()
  }

  ngOnInit() {
    //Создаем поля для формы
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(3),Validators.maxLength(255)]),
      password: new FormControl('', [Validators.required, Validators.minLength(3),Validators.maxLength(255)]),
    });

    this.formSetPassword = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(3),]),
      password_retry: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });


    //Получаем ид юзера и параметра маршрута
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => { 
      this.token = params['user_id']
      this.token ? this.loginAfterSocial(this.token) : this.loginAfterSocial('no')
    }); 
  }

  ngOnDestroy() {
     // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}