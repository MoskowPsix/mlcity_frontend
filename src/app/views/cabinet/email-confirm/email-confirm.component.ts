import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Subject } from 'rxjs'
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
export class EmailConfirmComponent implements OnInit {
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
  public userEmailConfirm: boolean = false
  public codeFocused!: boolean
  public currentStep: number = 0

  public leftPosotion: number = 0
  ngAfterViewInit() {
    this.codeFocused = true
  }
  ngOnChange() {}

  submitCode(event: any) {
    console.log(event)
  }

  nextStep(step: HTMLElement) {
    console.log(this.emailForm.invalid)
    console.log(step)
    this.leftPosotion += 100
    step.style.transition = '0.2s all'
    this.currentStep++
    step.style.marginLeft = `-${this.leftPosotion}vw`
  }
  codeRetry(event: any) {
    console.log('запрос на новый код')
  }
  backStep(step: HTMLElement) {
    this.leftPosotion -= 100
    console.log(this.leftPosotion)
    step.style.transition = '0.2s all'
    this.currentStep--
    step.style.marginLeft = `-${this.leftPosotion}vw`
  }
  closeModal() {
    this.router.navigate(['/home'])
  }
  ngOnInit(): void {
    this.emailForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      //         Validators.required,
      //         Validators.minLength(4),
      //       ]),
    })
  }
}
