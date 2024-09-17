import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { EMPTY, Subject, catchError, filter, of, takeUntil } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'
import { ToastService } from 'src/app/services/toast.service'
import { UserService } from 'src/app/services/user.service'
import { TokenService } from '../../services/token.service'
import { LoadingService } from 'src/app/services/loading.service'
import { environment } from 'src/environments/environment'
import { MessagesAuth } from 'src/app/enums/messages-auth'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { ActionSheetController } from '@ionic/angular'
import { Location } from '@angular/common'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'
import { RecoveryPasswordService } from 'src/app/services/recovery-password.service'
import { SignInWithApple, SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in'
import { Capacitor } from '@capacitor/core'
import { MobileOrNoteService } from 'src/app/services/mobile-or-note.service'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService, ToastService],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  vkontakteAuthUrl: string = environment.vkontakteAuthUrl
  appleAuthUrl: string = environment.appleAuthUrl
  yandexAuthUrl: string = environment.yandexAuthUrl
  user_id!: number
  loginForm!: FormGroup
  recoveryForm!: FormGroup
  responseData: any
  iconState: boolean = true
  token?: string
  timer: any
  timerReady: boolean = true
  seconds: number = 60
  target: string = ''
  mobile: boolean = false
  closeRecoveryModal: boolean = true
  modalPass: boolean = false
  presentingElement: undefined
  errPassword: boolean = false
  formSetPassword!: FormGroup
  appleState: Number = Math.floor(Math.random() * 21)

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private tokenService: TokenService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private location: Location,
    private titleService: Title,
    private mobileOrNoteService: MobileOrNoteService,
    private metaService: Meta,
    private recoveryPasswordService: RecoveryPasswordService,
  ) {
    this.titleService.setTitle('Вход на сайт vokrug.city')
    this.metaService.updateTag({
      name: 'description',
      content: 'Вход на сайт.',
    })
  }
  @HostListener('window:resize', ['$event'])
  mobileOrNote() {
    switch (Capacitor.getPlatform()) {
      case 'ios':
        this.mobile = true
        break
      case 'android':
        this.mobile = true
        break
      case 'web':
        this.mobile = false
        break
    }

    if (this.mobile == true) {
      this.target = '_self'
    } else if (this.mobile == false) {
      this.target = '_blank'
    }
  }
  loginPhone() {
    this.formSetPassword = new FormGroup({
      number: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password_retry: new FormControl('', [Validators.required, Validators.minLength(3)]),
    })
  }
  setPass() {
    this.modalPass = false
    this.loginForm.disable()
    this.loadingService.showLoading()
    this.authService
      .setPassword(this.formSetPassword.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formSetPassword.reset()
          this.formSetPassword.enable()
          this.positiveResponseAfterLogin(data)
        },
        error: (err) => {
          this.formSetPassword.reset()
          this.formSetPassword.enable()
          this.errorResponseAfterLogin(err)
          this.modalPass = true
        },
      })
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
    })
    actionSheet.present()
    const { role } = await actionSheet.onWillDismiss()
    return role === 'confirm'
  }

  public openPassword(event: any): void {
    if (event.type == 'password') {
      event.type = 'text'
    } else {
      event.type = 'password'
    }
  }

  onSubmitLogin() {
    this.loginForm.disable()
    this.loadingService.showLoading()
    this.authService
      .login(this.loginForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.tokenService.setToken(data.access_token)
          this.positiveResponseAfterLogin(data)
        },
        error: (err) => {
          this.recoveryPasswordChange()
          this.errorResponseAfterLogin(err)
        },
      })
  }

  loginAfterSocial(token: any) {
    this.onLoading
    if (token.length >= 47) {
      let token_arr = token.slice(',')
      if (token_arr.length == 2) {
        window.location.href = 'login' + token_arr[0]
      } else {
        this.tokenService.setToken(token)
        this.loginForm.disable()
        this.loadingService.showLoading()
        this.userService
          .getUserById()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data: any) => {
              // let timeZone = new Date().getTimezoneOffset()
              // let time = Math.ceil(new Date().getTime() / 100000)
              // let created_time = Math.ceil(new Date(data.user.social_account.created_at).getTime() / 100000)
              // let now_time = time
              // if (created_time === now_time) {
              //   this.modalPass = true
              // }
              this.positiveResponseAfterLogin(data)
            },
            error: (err) => {
              this.errorResponseAfterLogin(err)
            },
          })
      }
    }
  }

  onLoading() {
    this.loadingService.showLoading()
    setTimeout(() => {
      this.loadingService.hideLoading()
    }, 5000)
  }

  validateRecovery() {
    this.timerReady = false
    this.timer = setInterval(() => {
      if (this.seconds != 0 && !this.timerReady) {
        this.seconds--
      } else {
        clearInterval(this.timer)
        this.seconds = 60
        this.timerReady = true
      }
    }, 1000)
  }

  positiveResponseAfterLogin(data: any) {
    this.responseData = data
    this.userService.setUser(this.responseData.user)
    this.loadingService.hideLoading()
    this.loginForm.reset()
    this.loginForm.enable()

    if (!this.modalPass) {
      this.router.navigate(['home'])
    }
  }

  submitRecovery() {
    this.validateRecovery()
    this.loadingService.showLoading()
    this.recoveryPasswordService
      .recoveryPassword(this.recoveryForm.value.email)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.toastService.showToast('Почта не зарегестрированна', 'warning')
          this.loadingService.hideLoading()
          return of(EMPTY)
        }),
      )
      .subscribe((res: any) => {
        this.closeRecoveryModal = !this.closeRecoveryModal
        if (res.status) {
          this.toastService.showToast('Ссылка была отправлена на почту', 'success')
        }

        this.loadingService.hideLoading()
      })
  }

  errorResponseAfterLogin(err: any) {
    this.loadingService.hideLoading()
    this.toastService.showToast(err.error.message || MessagesErrors.default, 'warning')
    this.loginForm.enable()
  }

  recoveryPasswordChange() {
    this.errPassword = true
  }

  MailOrName() {
    let loginValue: string = this.loginForm.value.name
    let loginValueArr: string[] = loginValue.split('')

    for (let i: number = 0; i < loginValue.length; i++) {
      if (loginValueArr[i] == '@') {
        this.iconState = false
        break
      } else {
        this.iconState = true
      }
    }
  }

  async loginApple() {
    if (Capacitor.getPlatform() == 'ios') {
      const options: SignInWithAppleOptions = {
        clientId: environment.appleClientId,
        redirectURI: environment.appleAuthUrl,
        state: String(this.appleState),
        nonce: 'nonce',
      }

      SignInWithApple.authorize(options)
        .then((res: SignInWithAppleResponse) => {
          this.authService
            .loginApple(res.response)
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                this.toastService.showToast('При авторизвции apple что-то пошло не так', 'warning')
                return of(EMPTY)
              }),
            )
            .subscribe((response) => {
              this.loginAfterSocial(response.token)
            })
        })
        .catch((e) => {
          console.log(e)
          this.toastService.showToast('При авторизвции apple что-то пошло не так', 'warning')
          return of(EMPTY)
        })
    } else {
      window.open(environment.appleAuthUrl)
    }
  }

  ngOnInit() {
    this.mobileOrNote()
    //Создаем поля для формы
    this.loginForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
    })

    this.formSetPassword = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password_retry: new FormControl('', [Validators.required, Validators.minLength(3)]),
    })

    this.recoveryForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    })

    //Получаем ид юзера и параметра маршрута
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.token = params['user_id']
      this.token ? this.loginAfterSocial(this.token) : this.loginAfterSocial('no')
    })
    this.MailOrName()
  }
  // async loginVK() {
  //   VKAuth.initWithId({id: ''})
  //   VKAuth.auth({ scope: ['offline', 'groups', 'stats', 'wall'] })
  // //   VKAuth.addListener("vkAuthFinished", (info) => {
  // //     console.log("vkAuthFinished was fired", JSON.stringify(info, null, 2));
  // // });
  //   // .then((res) => {
  //   //   console.log(res)
  //   // }).catch((err) => {
  //   //   console.log(err)
  //   // })
  //   document.addEventListener("vkAuthFinis he                      d", (event: any) => {
  //       const info = event.detail; // Получаем информацию из события
  //       console.log("vkAuthFinished was fired", JSON.stringify(info, null, 2));
  //   });

  // }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
