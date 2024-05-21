import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import {
  EMPTY,
  Subject,
  catchError,
  delay,
  filter,
  map,
  of,
  retry,
  takeUntil,
  tap,
} from 'rxjs'
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
import { Metrika } from 'ng-yandex-metrika'
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

  @ViewChild('modal') modal!: IonModal

  readonly phoneMask: MaskitoOptions = {
    mask: [
      '+',
      '7',
      ' ',
      '(',
      /\d/,
      /\d/,
      /\d/,
      ')',
      ' ',
      /\d/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
  }

  readonly maskPredicate: MaskitoElementPredicate = async (el: any) =>
    (el as HTMLIonInputElement).getInputElement()

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
    private metrika: Metrika,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
  ) {
    this.titleService.setTitle('Регистрация на сайте MLCity.')
    this.metaService.updateTag({
      name: 'description',
      content: 'Регистрация на сайте.',
    })

    let prevPath = this.location.path()
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const newPath = location.path()
        this.metrika.hit(newPath, {
          referer: prevPath,
          callback: () => {
            console.log('hit end')
          },
        })
        prevPath = newPath
      })
  }

  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      password_confirmation: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      number: new FormControl('', [
        Validators.minLength(10),
        Validators.minLength(10),
      ]),
      avatar: new FormControl(''),
    })

    this.modalForm = new FormGroup({
      emailConfirmInput: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    })

    this.OpenPassword('reg_password')
    this.OpenPasswordConfirm('confirm_password', event)
  }

  checkName() {
    this.busyName = this.registerForm.value.name
    if (
      this.registerForm.value.name.length != ' ' &&
      this.registerForm.value.name.length != ''
    ) {
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

  cancel() {
    this.modal.dismiss(null, 'cancel')
  }

  checkEmail() {
    this.busyEmail = this.registerForm.value.email
    if (!this.registerForm.controls['email'].invalid) {
      this.authservice
        .checkEmail(this.registerForm.value.email)
        .pipe(
          map((respons: any) => {
            this.emailBusy = respons.user_email
          }),
          catchError((err) => {
            return of(EMPTY)
          }),
        )
        .subscribe()
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

  checkPassword() {
    if (
      this.registerForm.value.password ==
      this.registerForm.value.password_confirmation
    ) {
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

  OpenPasswordConfirm(input: string, event: any) {
    let passwordInput: any = document.getElementById(input)
    let img: any = document.getElementById('eye_img_confirm')
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'
      img.src = '../assets/icons/eye_open.svg'
    } else if (passwordInput.type === 'text') {
      passwordInput.type = 'password'
      img.src = '../assets/icons/eye_closed.svg'
    }
  }

  confirmEmail() {
    if (this.modalForm.value.emailConfirmInput.length == 4) {
      this.authservice
        .verfiEmail(+this.modalForm.value.emailConfirmInput)
        .pipe(
          delay(100),
          map((respons: any) => {
            this.cancel()
            if (respons.status === 'success') {
              this.modal
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
    if (
      this.modalForm.value.emailConfirmInput.length >= 3 &&
      this.codeCount == 1
    ) {
      this.confirmCode = true
      this.codeCount = 0
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

  async onSubmitReg() {
    this.loadingService.showLoading()
    await this.checkPassword()
    await this.checkEmail()
    await this.checkName()
    await this.SubmitPhone()
    await this.checkNumber()

    if (this.emailBusy && this.nameBusy && this.busyPass && this.privacyCheck) {
      this.authservice
        .register(this.registerForm.value)
        .pipe(
          map((respons: any) => {
            this.RetryCode()
            this.timerRetryButton = false
            this.submitResponce = true
            //this.confirmEmail();
            if (respons.status == 'success') {
              this.toastService.showToast(
                'Вы успешно зарегестрировались!!!',
                'success',
              )
              respons.access_token
                ? this.loginAfterSocial(respons.access_token)
                : this.loginAfterSocial('no')
            }
            this.loadingService.hideLoading()
            // this.registerForm.disable();
          }),

          tap(() => {}),
          catchError((err) => {
            console.log(err)
            this.loadingService.hideLoading()
            this.toastService.showToast(err.error.message, 'warning')
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe()
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

        let formattedTime =
          (minutes < 10 ? '0' + minutes : minutes) +
          ':' +
          (seconds < 10 ? '0' + seconds : seconds)
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
      .retryCode()
      .pipe(
        map((respons: any) => {}),
        catchError((err) => {
          return of(EMPTY)
        }),
      )
      .subscribe()
  }
}
