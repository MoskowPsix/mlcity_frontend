import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { catchError, EMPTY, finalize, of, Subject, takeUntil, tap } from 'rxjs'
import { IUser } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { LoadingService } from 'src/app/services/loading.service'
import { NavigationService } from 'src/app/services/navigation.service'
import { ToastService } from 'src/app/services/toast.service'
import { UserService } from 'src/app/services/user.service'

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.scss'],
})
export class EmailConfirmComponent implements OnInit, OnDestroy {
  constructor(
    private userService: UserService,
    private loadingService: LoadingService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
  ) {}
  private destroy$ = new Subject<void>()
  public emailForm!: FormGroup
  @Input() openModal!: boolean
  @ViewChild('step') step: any
  public userWithEmail: boolean = false
  public userEmailConfirm: boolean = false
  public willRequestToGetCode: boolean = false
  public emailConfirm: boolean = false
  public codeFocused!: boolean
  public timer: number = 120
  public user: IUser = {
    id: 0,
    name: '',
    email: 'mega.kefi36@gmail.com',
    avatar: '',
  }
  public currentStep: number = 0
  public stepConfirm: boolean = true
  public emailChangeValue: boolean = false

  public leftPosotion: number = 0

  nextStep(step: HTMLElement) {
    if (this.stepConfirm) {
      this.leftPosotion += 100
      step.style.transition = '0.2s all'
      this.currentStep++
      step.style.marginLeft = `-${this.leftPosotion}vw`
    }
  }
  codeRetry() {
    this.authService
      .getEmailCode()
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$),
        catchError((err: any) => {
          console.log(err)
          this.loadingService.hideLoading()
          console.log(err.status)
          if (err.status !== 400) {
          } else {
            this.toastService.showToast(`Попробуйте позже`, 'danger')
          }
          return of(EMPTY)
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.loadingService.hideLoading()
          if ((res.status = 'success')) {
          }
        },
      })
  }

  emailChange() {
    this.willRequestToGetCode = false
    this.userWithEmail = false
    this.emailForm.setValue({
      email: '',
    })
  }
  backStep(step: HTMLElement) {
    if (this.stepConfirm) {
      this.leftPosotion -= 100
      step.style.transition = '0.2s all'
      this.currentStep--
      step.style.marginLeft = `-${this.leftPosotion}vw`
    }
  }
  closeModal() {
    this.router.navigate(['/home'])
  }
  submitCode(event: any) {
    this.loadingService.showLoading()
    this.authService
      .verfiEmail(Number(event))
      .pipe(
        catchError((err: any) => {
          console.log(err)

          this.loadingService.hideLoading()
          console.log(err.status)
          if (err.status !== 400) {
          }
          if (err.status == 400) {
            this.toastService.showToast(`Попробуйте позже`, 'danger')
            this.stepConfirm = false
          }
          if (err.status == 403) {
            this.toastService.showToast(`код не верный`, 'danger')
          }

          return of(EMPTY)
        }),
      )
      .subscribe((res: any) => {
        if (res.status == 'success') {
          this.userService
            .getUserById()
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: any) => {
              let tempUser: IUser = user.user
              this.userService.setUserToLocalStorage(tempUser)
              this.router.navigate(['/home'])
              this.loadingService.hideLoading()
              this.toastService.showToast('Ваша успешно почта подтверждена!', 'success')
            })
        }
      })
  }

  showMessageVerificated() {
    this.toastService.showToast('Ваша почта уже подтверждена', 'warning')
    this.router.navigate(['/home'])
  }

  getCode() {
    if (!this.willRequestToGetCode) {
      this.loadingService.showLoading()
      this.willRequestToGetCode = true

      if (!this.userWithEmail) {
        this.stepConfirm = false
        this.authService
          .editEmailNotVerification(this.emailForm.value)
          .pipe(
            catchError((err: any) => {
              this.willRequestToGetCode = false
              console.log(err)
              this.loadingService.hideLoading()
              this.toastService.showToast(err.error.message,'danger')
              if (err.status !== 400) {
              } else {
                this.toastService.showToast(`Попробуйте позже`, 'danger')
              }
              return of(EMPTY)
            }),
          )
          .subscribe((res: any) => {
            this.loadingService.hideLoading()
            if (res.status === 'success') {
              this.toastService.showToast('Ваша успешно почта добавлена!', 'success')
              this.stepConfirm = true
              this.userWithEmail = true
              this.timer = 120
              this.userService
                .getUserById()
                .pipe(
                  tap((res: any) => {
                    let tempUser: IUser = res.user
                    this.userService.setUserToLocalStorage(tempUser)
                    this.nextStep(this.step.nativeElement)
                    this.loadingService.hideLoading()
                  }),
                )
                .subscribe(() => {
                  this.authService.getEmailCode().subscribe((response) => {})
                })
            }
          })
      } else {
        this.stepConfirm = false
        this.willRequestToGetCode = true
        this.authService
          .getEmailCode()
          .pipe(
            finalize(() => {}),
            takeUntil(this.destroy$),
            catchError((err: any) => {
              this.loadingService.hideLoading()
              if (err.status !== 400) {
              } else {
                this.toastService.showToast(`Попробуйте позже`, 'danger')
                this.stepConfirm = false
              }
              return of(EMPTY)
            }),
          )
          .subscribe({
            next: (res: any) => {
              this.loadingService.hideLoading()
              if ((res.status = 'success')) {
                this.stepConfirm = true
                this.nextStep(this.step.nativeElement)
              }
            },
          })
      }
    } else {
      this.willRequestToGetCode = true
      this.nextStep(this.step.nativeElement)
    }
    // this.loadingService.showLoading()

    //
    // }
  }

  ionViewDidLeave() {
    this.leftPosotion = 0
    // this.destroy$.complete()
  }
  ngOnDestroy() {}
  ionViewDidEnter() {}

  //местный ngOnit
  ionViewWillEnter() {
    this.loadingService.showLoading()
    this.userService
      .getUserById()
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res: any) => {
          this.user = res.user
          this.emailForm.patchValue({
            email: this.user.email,
          })
          if (this.user.email) {
            this.userWithEmail = true
          } else {
            this.userWithEmail = false
          }
          this.emailConfirm = this.user.email_verified_at !== null
          this.step.nativeElement.style.marginLeft = '0px'
          this.loadingService.hideLoading()
        },
      })
  }

  ngOnInit(): void {
    this.willRequestToGetCode = false
    this.emailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(3)]),
    })
  }
}
