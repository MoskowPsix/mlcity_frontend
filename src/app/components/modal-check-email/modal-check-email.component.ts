import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { catchError, delay, EMPTY, map, of, Subject, takeUntil } from 'rxjs'
import { NavigationService } from 'src/app/services/navigation.service'
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service'
import { Router } from '@angular/router'
import { IonModal } from '@ionic/angular'
import { ToastService } from 'src/app/services/toast.service'
import { LoadingService } from 'src/app/services/loading.service'
import { UserService } from 'src/app/services/user.service'

@Component({
  selector: 'app-modal-check-email',
  templateUrl: './modal-check-email.component.html',
  styleUrls: ['./modal-check-email.component.scss'],
})
export class ModalCheckEmailComponent implements OnInit {
  constructor(
    private userService: UserService,
    private loadingService: LoadingService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
  ) {}
  private readonly destroy$ = new Subject<void>()
  public emailForm!: FormGroup
  @Input() openModal!: boolean
  @Output() closeModalEmitter = new EventEmitter()
  public userEmail: boolean = false
  public userEmailConfirm: boolean = false
  public codeFocused!: boolean
  public currentStep: number = 0

  public leftPosotion: number = 0
  ngAfterViewInit() {
    this.codeFocused = true
  }
  ngOnChange() {}
  checkEmail() {
    this.userEmail = this.userService.getUserFromLocalStorage()?.email !== null
    this.userEmailConfirm = this.userService.getUserFromLocalStorage()?.email_verified_at !== null
  }
  submitCode(event: any) {}
  nextStep(step: HTMLElement) {
    this.leftPosotion += 100
    step.style.transition = '0.2s all'
    this.currentStep++
    step.style.marginLeft = `-${this.leftPosotion}vw`
  }
  backStep(step: HTMLElement) {
    this.leftPosotion -= 100
    step.style.transition = '0.2s all'
    this.currentStep--
    step.style.marginLeft = `-${this.leftPosotion}vw`
  }
  closeModal() {
    this.closeModalEmitter.emit()
  }
  ngOnInit(): void {
    this.checkEmail()
    this.emailForm = new FormGroup({
      email: new FormControl('', []),
      //         Validators.required,
      //         Validators.minLength(4),
      //       ]),
    })
  }
}
//   constructor(
//     private userService: UserService,
//     private loadingService: LoadingService,
//     private navigationService: NavigationService,
//     private authService: AuthService,
//     private router: Router,
//     private toastService: ToastService,
//   ) {}
//   submitResponse: boolean = false
//   modalForm!: FormGroup
//   codeCount: number = 0
//   confirmCode: boolean = true
//   timerRetryButton: boolean = false
//   timerRertyFormated: any = 0
//   vueButton: boolean = true

//   @ViewChild('modal') modal!: IonModal

//   readonly phoneMask: MaskitoOptions = {
//     mask: [
//       '+',
//       '7',
//       ' ',
//       '(',
//       /\d/,
//       /\d/,
//       /\d/,
//       ')',
//       ' ',
//       /\d/,
//       /\d/,
//       /\d/,
//       '-',
//       /\d/,
//       /\d/,
//       /\d/,
//       /\d/,
//     ],
//   }

//   readonly maskPredicate: MaskitoElementPredicate = async (el: any) =>
//     (el as HTMLIonInputElement).getInputElement()

//   readonly maskNumber: MaskitoOptions = {
//     mask: [...Array(4).fill(/\d/)],
//   }

//   cancel() {
//     this.navigationService.modalAuthEmail.next(false)
//   }

//   confirmEmail() {
//     console.log(this.modalForm.value.emailConfirmInput.length)
//     if (this.modalForm.value.emailConfirmInput.length == 4) {
//       this.authService
//         .verfiEmail(+this.modalForm.value.emailConfirmInput)
//         .pipe(
//           delay(100),
//           map(() => {
//             this.cancel()
//           }),
//           catchError((err) => {
//             this.toastService.showToast(err.message, 'warning')
//             if (err.status == 403 || err.status == 401) {
//               this.confirmCode = false
//               this.codeCount = 1
//             }
//             return of(EMPTY)
//           }),
//         )
//         .subscribe(() => {
//           this.setUserForLocalStorage()
//         })
//     }
//   }

//   setUserForLocalStorage(): void {
//     this.loadingService.showLoading()
//     this.userService
//       .getUserById()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: any) => {
//           this.userService.setUser(data.user)
//           this.loadingService.hideLoading()
//         },
//         error: (err) => {
//           this.loadingService.hideLoading()
//         },
//       })
//   }

//   CodeCountFn() {
//     if (
//       this.modalForm.value.emailConfirmInput.length >= 3 &&
//       this.codeCount == 1
//     ) {
//       this.confirmCode = true
//       this.codeCount = 0
//     }
//   }

//   RertryCodeBtn() {
//     this.vueButton = false
//     this.timerRetryButton = false
//     this.RetryCode()
//     this.authService
//       .retryCode()
//       .pipe(
//         map(() => {}),
//         catchError((err) => {
//           return of(EMPTY)
//         }),
//       )
//       .subscribe()
//   }

//   RetryCode() {
//     let minutes: any = 0
//     let seconds: any = 15
//     let interval: any

//     interval = setInterval(() => {
//       if (minutes >= 0) {
//         seconds--

//         if (seconds < 0) {
//           seconds = 59
//           minutes--
//         }

//         let formattedTime =
//           (minutes < 10 ? '0' + minutes : minutes) +
//           ':' +
//           (seconds < 10 ? '0' + seconds : seconds)
//         this.timerRertyFormated = formattedTime

//         if (minutes === 0 && seconds === 0) {
//           clearInterval(interval)
//           this.timerRetryButton = true
//         }
//       }
//     }, 1000)
//   }

//   ngOnInit(): void {
//     this.navigationService.modalAuthEmail
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((value) => {
//         this.submitResponse = value
//       })
//     this.modalForm = new FormGroup({
//       emailConfirmInput: new FormControl('', [
//         Validators.required,
//         Validators.minLength(4),
//       ]),
//     })
//   }
// }
