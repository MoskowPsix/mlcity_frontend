import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Platform } from '@ionic/angular'
import { catchError, EMPTY, of, Subject, Subscription, takeUntil } from 'rxjs'
import { IUser } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { LoadingService } from 'src/app/services/loading.service'
import { ToastService } from 'src/app/services/toast.service'
import { UserService } from 'src/app/services/user.service'
import { environment } from 'src/environments/environment'
import { NavigationService } from 'src/app/services/navigation.service'
import { RecoveryPasswordService } from 'src/app/services/recovery-password.service'
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  isMobile!: boolean
  user!: IUser
  constructor(
    private router: Router,
    private platform: Platform,
    private userService: UserService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private navigationService: NavigationService,
    private recoveryPasswordService: RecoveryPasswordService,
  ) {}

  private readonly destroy$ = new Subject<void>()
  subscription_2!: Subscription
  resetForm: FormGroup = new FormGroup({})
  passwordResetForm: FormGroup = new FormGroup({})
  formData: FormData = new FormData()
  avatar: string = ''
  avatarLoad: boolean = false
  public email: boolean = this.navigationService.modalAuthEmail.value
  public modalEmail: boolean = true
  avatarUrl!: string
  passwordChange: boolean = false
  passwordError: string = ''
  public step: number = 0
  public new_name: FormControl = new FormControl('')
  previewPhotoUrl!: string
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`

  getUser() {
    this.userService.getUser().subscribe((user: any) => {
      this.user = user
      if (this.user.avatar && this.user.avatar.includes('https')) {
        this.avatarUrl = this.user.avatar
      } else {
        this.avatarUrl = `${this.backendUrl}${this.user.avatar}`
      }
      this.avatarLoad = true
    })
  }

  createFormData() {
    this.formData.append('new_name', this.resetForm.value.new_name)
    return this.formData
  }

  deleteUser() {
    this.loadingService.showLoading()
    this.userService
      .deleteUser()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          if (err.status == 403 || err.status == 401) {
            this.authService.logout()
          }
          this.loadingService.hideLoading()
          this.toastService.showToast('Не удалось удалить профиль', 'danger')
          return of(EMPTY)
        }),
      )
      .subscribe((response) => {
        this.toastService.showToast('Профиль удалён', 'success')
        this.loadingService.hideLoading()
        this.authService.logout()
      })
  }

  onSubmit() {
    if (this.resetForm.status == 'VALID') {
      let user: FormData = this.createFormData()
      this.loadingService.showLoading()
      this.userService
        .changeName(user)
        .pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            if (err.status == 401) {
              this.authService.logout()
            }
            this.loadingService.hideLoading()
            this.toastService.showToast(
              'Убедитесь что поле Имя не пустое',
              'danger',
            )
            return of(EMPTY)
          }),
        )
        .subscribe((response: any) => {
          if (response.status == 'success') {
            this.userService.setUser(response.user)
            this.getUser()
            this.previewPhotoUrl = ''
            this.loadingService.hideLoading()
            this.toastService.showToast('Данные обновлены!', 'success')
          }
        })
    }
  }

  checkEmail() {
    this.navigationService.modalAuthEmail.pipe().subscribe(() => {
      this.email = this.navigationService.modalAuthEmail.value
    })
  }

  checkPassword() {
    if (
      this.passwordResetForm.valid ||
      this.passwordResetForm.value.new_password !==
        this.passwordResetForm.value.retry_password
    ) {
      this.passwordError = 'ошибка'
    } else {
      this.passwordError = ''
      console.log('ошибка')
    }
  }

  submitPassword() {
    this.checkPassword()
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0]
    if (file) {
      this.formData.append('avatar', file, file.name)
      this.previewPhoto(file)
    }
  }
  openPasswordBlock() {
    this.loadingService.showLoading()
    this.userService
      .getUserById()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.toastService.showToast(`${err.messages}`, 'danger')
          return of(EMPTY)
        }),
      )
      .subscribe((res: any) => {
        if (res.user.email_verified_at) {
          this.recoveryPasswordService
            .recoveryPassword(res.user.email)
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                console.log(err)
                return of(EMPTY)
              }),
            )
            .subscribe((res: any) => {
              this.loadingService.hideLoading()
              this.toastService.showToast(
                'Ссылка для смены пароля была отправлена вам на почту',
                'success',
              )
            })
        } else {
          this.loadingService.hideLoading()
          this.router.navigate(['/email-confirm'])
        }
      })
    // this.passwordChange = true
    // let block = event
    // block.classList.toggle('password-inputs-wrapper_active')
    // plug.classList.toggle('plug-password-wrapper_active')
    // setTimeout(() => {
    //   plug.classList.add('plug-password-wrapper_none')
    // }, 500)
  }
  previewPhoto(file: File) {
    const reader: FileReader = new FileReader()
    reader.onload = () => {
      this.previewPhotoUrl = reader.result as string
    }
    reader.readAsDataURL(file)
  }
  closeModal() {
    this.modalEmail = false
    setTimeout(() => {
      this.router.navigate(['/home'])
    }, 10)
  }
  ngOnInit() {
    this.checkEmail()
    this.isMobile = this.platform.is('mobile')
    this.getUser()
    this.passwordResetForm = new FormGroup({
      old_password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      old_password_plug: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      new_password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      retry_password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    })
    this.resetForm = new FormGroup({
      new_name: new FormControl(this.user.name, [Validators.minLength(1)]),
    })
  }
}
