import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { EMPTY, Subject, catchError, delay, filter, map, of, retry, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { AuthService } from 'src/app/services/auth.service'
import { ToastService } from 'src/app/services/toast.service'
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core'
import { LoadingService } from 'src/app/services/loading.service'
import { UserService } from 'src/app/services/user.service'
import { TokenService } from 'src/app/services/token.service'
import { NavigationEnd, Router } from '@angular/router'

import { IonModal } from '@ionic/angular'
// import { MessagesErrors } from 'src/app/enums/messages-register';
import internal from 'stream'
import { Location } from '@angular/common'
import { environment } from 'src/environments/environment'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  privacyCheck: boolean = false
  registerForm!: FormGroup
  modalForm!: FormGroup
  nameBusy: boolean = true
  emailBusy: boolean = true
  passwordConfirm: boolean = true
  busyName: string = ''
  busyEmail: string = ''
  busyPass: boolean = true
  submitResponce: boolean = false
  modalOpen: boolean = false
  busyNumber: boolean = true
  modalCount: number = 0
  confirmCode: boolean = true
  codeCount: number = 0
  interval: any
  timerRertyFormated: any = 0
  timerRetryButton: boolean = false
  vkontakteAuthUrl: string = environment.vkontakteAuthUrl
  registartionInvalid = {
    localError: false,
    serverError: false,
    email: {
      status: false,
      message: '',
    },
    name: {
      status: false,
      message: '',
    },
    password: {
      status: false,
      message: '',
    },
    passwordRequired: {
      status: false,
      message: '',
    },
  }
  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  }

  readonly maskPredicate: MaskitoElementPredicate = async (el: any) => (el as HTMLIonInputElement).getInputElement()

  readonly maskNumber: MaskitoOptions = {
    mask: [...Array(4).fill(/\d/)],
  }

  constructor(
    private toastService: ToastService,
    private authservice: AuthService,
    private loadingService: LoadingService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
  ) {
    this.titleService.setTitle('Регистрация на сайте MLCity.')
    this.metaService.updateTag({
      name: 'description',
      content: 'Регистрация на сайте.',
    })
  }

  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      password_confirmation: new FormControl('', [Validators.required, Validators.minLength(8)]),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      number: new FormControl('', [Validators.minLength(10), Validators.minLength(10)]),
      avatar: new FormControl(''),
    })

    this.modalForm = new FormGroup({
      emailConfirmInput: new FormControl('', [Validators.required, Validators.minLength(4)]),
    })
  }

  checkName() {
    this.busyName = this.registerForm.value.name
    if (this.registerForm.value.name.length != ' ' && this.registerForm.value.name.length != '') {
      if (!this.registerForm.controls['name'].invalid) {
        this.authservice
          .checkName(this.registerForm.value.name)
          .pipe(
            map((respons: any) => {
              this.nameBusy = respons.user_name
            }),
            catchError((err) => {
              return of(EMPTY)
            }),
            takeUntil(this.destroy$),
          )
          .subscribe()
      }
    }
  }

  checkNumber() {
    this.authservice
      .checkNumber(this.registerForm.value.number)
      .pipe(
        map((respons: any) => {
          this.busyNumber = respons.user_number
        }),
        catchError((err) => {
          return of(EMPTY)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  validateForm() {
    this.registartionInvalid.localError = false
    if (this.registerForm.get('email')?.errors) {
      this.registartionInvalid.localError = true
      this.registartionInvalid.email.status = true
      if (this.registerForm.get('email')?.hasError('required')) {
        this.registartionInvalid.email.message = 'Поле не может быть пустым'
      } else if (this.registerForm.get('email')?.hasError('email')) {
        this.registartionInvalid.email.message = 'Введите корректный E-mail'
      } else if (this.registerForm.get('email')?.hasError('minLength')) {
        this.registartionInvalid.email.message = 'E-mail должен быть не менее 3 символов'
      }
    } else {
      this.registartionInvalid.email.status = false
      this.registartionInvalid.email.message = ''
    }

    this.registartionInvalid.localError = false
    if (this.registerForm.get('name')?.errors) {
      this.registartionInvalid.localError = true
      this.registartionInvalid.name.status = true
      this.registartionInvalid.name.message = this.registerForm.get('name')?.hasError('required')
        ? 'Поле не может быть пустым'
        : 'Имя должно быть не менее 3 символов'
    } else {
      this.registartionInvalid.name.status = false
      this.registartionInvalid.name.message = ''
    }

    if (this.registerForm.get('password')?.errors) {
      this.registartionInvalid.localError = true
      this.registartionInvalid.password.status = true
      this.registartionInvalid.password.message = this.registerForm.get('password')?.hasError('required')
        ? 'Поле не может быть пустым'
        : 'Пароль должен быть не менее 8 символов'
    } else {
      this.registartionInvalid.password.status = false
      this.registartionInvalid.password.message = ''
    }
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      this.registartionInvalid.localError = true
      this.registartionInvalid.passwordRequired.status = true
      this.registartionInvalid.passwordRequired.message = 'Пароли не совпадают'
    } else {
      this.registartionInvalid.passwordRequired.status = false
      this.registartionInvalid.passwordRequired.message = ''
    }
  }

  checkPassword() {
    if (this.registerForm.value.password == this.registerForm.value.password_confirmation) {
      this.busyPass = true
    } else {
      this.busyPass = false
    }
  }

  OpenPassword(input: string) {
    let passwordInput: any = document.getElementById('reg_password')
    let img: any = document.getElementById('eye_img')
    if (passwordInput.type == 'password') {
      img.src = '../assets/icons/eye_open.svg'
      passwordInput.type = 'text'
    } else if (passwordInput.type == 'text') {
      passwordInput.type = 'password'
      img.src = '../assets/icons/eye_closed.svg'
    }
  }

  SubmitPhone() {
    let clearPhone: string = this.registerForm.value.number
    let newStr = clearPhone.replace(/\+7|\s|\-|\(|\)/g, '')
    this.registerForm.value.number = newStr
  }

  confirmEmail() {
    if (this.modalForm.value.emailConfirmInput.length == 4) {
      this.authservice
        .verfiEmail(+this.modalForm.value.emailConfirmInput)
        .pipe(
          delay(100),
          map((respons: any) => {
            if (respons.status === 'success') {
              this.router.navigate(['cabinet'])
              this.registerForm.reset()
              this.registerForm.enable()
            } else {
            }
          }),
          catchError((err) => {
            this.toastService.showToast(err.message, 'warning')
            if (err.status == 403 || err.status == 401) {
              this.confirmCode = false
              this.codeCount = 1
            }
            return of(EMPTY)
          }),
        )
        .subscribe()
    }
  }

  CodeCountFn() {
    if (this.modalForm.value.emailConfirmInput.length >= 3 && this.codeCount == 1) {
      this.confirmCode = true
      this.codeCount = 0
    }
  }

  clearErrors() {
    if (this.registartionInvalid.localError || this.registartionInvalid.serverError) {
      this.validateForm()
    }
  }
  loginAfterSocial(token: any) {
    if (token.length >= 47) {
      this.tokenService.setToken(token)
      // this.registerForm.disable()
      this.loadingService.showLoading()
      this.userService
        .getUserById()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.positiveResponseAfterLogin(data)
          },
          error: (err) => {
            this.loadingService.hideLoading()
          },
        })
    }
  }

  positiveResponseAfterLogin(data: any) {
    this.userService.setUser(data.user)
    this.loadingService.hideLoading()
    // this.registerForm.reset()
    // this.registerForm.enable()
    // this.router.navigate(['cabinet']);
  }
  errorResponseAfterRegistration(err: any) {
    this.registartionInvalid.serverError = true
    this.loadingService.hideLoading()
    let allErors = err.error.errors
    if ((err.status = 422)) {
      allErors.name
        ? ((this.registartionInvalid.name.status = true),
          (this.registartionInvalid.name.message = 'Такое имя уже занято'))
        : null
      allErors.email
        ? ((this.registartionInvalid.email.status = true),
          (this.registartionInvalid.email.message = 'Такая почта уже занята'))
        : null
    }
    console.log(allErors)

    let message = err.error.message
    // this.toastService.showToast(err.error.message || MessagesErrors.default, 'warning')

    if (message === MessagesErrors.emailNotCorrect) {
      this.registartionInvalid.email.status = true
      this.registartionInvalid.email.message = 'Введите корректный E-mail'
    }
  }

  async onSubmitReg() {
    this.validateForm()
    if (!this.registartionInvalid.localError) {
      this.loadingService.showLoading()
      await this.checkPassword()

      await this.checkName()

      if (this.emailBusy) {
        this.authservice
          .register(this.registerForm.value)
          .pipe(
            map((respons: any) => {
              this.RetryCode()
              this.timerRetryButton = false
              this.submitResponce = true
              //this.confirmEmail();
              if (respons.status == 'success') {
                this.router.navigate(['/email-confirm'], { replaceUrl: true })
                this.toastService.showToast('Вы успешно зарегестрировались!!!', 'success')
                respons.access_token ? this.loginAfterSocial(respons.access_token) : this.loginAfterSocial('no')
              }
              this.loadingService.hideLoading()
              // this.registerForm.disable();
            }),

            tap(() => {}),
            catchError((err) => {
              this.errorResponseAfterRegistration(err)
              this.loadingService.hideLoading()
              return of(EMPTY)
            }),
            takeUntil(this.destroy$),
          )
          .subscribe()
      }
    }
  }

  RetryCode() {
    // let minutes:any = 1;
    // let seconds:any = 59;
    // let interval:any
    // this.interval = setInterval(()=>{
    //   if(minutes > 0){

    //     seconds--
    //   }
    //   if(seconds == 0){
    //     seconds = 59
    //     minutes--
    //   }else if(minutes == 0 && seconds == 0){
    //     clearInterval(this.interval);
    //   }

    //   console.log(minutes,seconds)
    //   if(minutes < 0){
    //     console.log(0 +':'+seconds)
    //   }
    //   if(seconds < 10){
    //     console.log(minutes+':'+"0"+seconds)
    //   }
    // },1000)

    let minutes: any = 0
    let seconds: any = 15
    let interval: any

    interval = setInterval(() => {
      if (minutes >= 0) {
        seconds--

        if (seconds < 0) {
          seconds = 59
          minutes--
        }

        let formattedTime = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)
        this.timerRertyFormated = formattedTime

        if (minutes === 0 && seconds === 0) {
          clearInterval(interval)
          this.timerRetryButton = true
        }
      }
    }, 1000)
  }

  RertryCodeBtn() {
    this.timerRetryButton = false
    this.RetryCode()
    this.authservice
      .getEmailCode()
      .pipe(
        map((respons: any) => {}),
        catchError((err) => {
          return of(EMPTY)
        }),
      )
      .subscribe()
  }
}
