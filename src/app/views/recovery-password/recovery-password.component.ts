import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { EMPTY, catchError, of } from 'rxjs'
import { RecoveryPasswordService } from 'src/app/services/recovery-password.service'
import { LoadingService } from 'src/app/services/loading.service'
import { ToastService } from 'src/app/services/toast.service'
@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss'],
})
export class RecoveryPasswordComponent implements OnInit {
  recoveryForm!: FormGroup
  passwordConfirm: boolean = false
  showErrPass: boolean = false
  showErrPassVerified: boolean = false
  profileBeChangedError: string =
    'The profile was changed less than 24 hours ago. The password can be changed 24 hours after the profile change.'
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private recoveryPasswordService: RecoveryPasswordService,
    private loadingService: LoadingService,
    private toastService: ToastService,
  ) {}

  showErrPassFunc() {
    this.showErrPass = true
  }
  updateValidators() {
    this.showErrPassVerified = true
    if (
      this.recoveryForm.value.password ==
      this.recoveryForm.value.password_confirmation
    ) {
      this.passwordConfirm = true
    } else {
      this.passwordConfirm = false
    }
  }

  changeCode() {
    this.recoveryForm.patchValue({
      code: this.activatedRoute.snapshot.params['code'],
    })
  }

  onSubmit() {
    this.loadingService.showLoading()
    this.recoveryPasswordService
      .newPassword(this.recoveryForm.value)
      .pipe(
        catchError((err) => {
          if (err.error.message == this.profileBeChangedError) {
            this.toastService.showToast(
              'Вы уже меняли ваш пароль сегодня. Вернитесь через 24 часа.',
              'danger',
            )
            this.router.navigate(['login'])
          } else {
            this.toastService.showToast(`${err.error.message}`, 'danger')
          }

          this.loadingService.hideLoading()
          return of(EMPTY)
        }),
      )
      .subscribe((res) => {
        this.loadingService.hideLoading()
        if (res.status == 'success') {
          this.toastService.showToast('Вы успешно сменили пароль', 'success')
          this.router.navigate(['login'])
        }
      })
  }

  ngOnInit() {
    this.recoveryForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
      ]),
      password_confirmation: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
      ]),
      code: new FormControl(''),
    })
    this.changeCode()
  }
}
