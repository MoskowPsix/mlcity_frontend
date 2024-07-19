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
  ) {}

  private readonly destroy$ = new Subject<void>()
  subscription_2!: Subscription
  resetForm: FormGroup = new FormGroup({})
  passwordResetForm: FormGroup = new FormGroup({})
  formData: FormData = new FormData()
  avatar: string = ''
  avatarLoad: boolean = false
  avatarUrl!: string
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0]
    if (file) {
      this.formData.append('avatar', file, file.name)
      this.previewPhoto(file)
    }
  }
  openPasswordBlock(event: HTMLElement, plug: HTMLElement) {
    console.log(event)
    let block = event
    block.classList.toggle('password-inputs-wrapper_active')
    plug.classList.toggle('plug-password-wrapper_active')
    setTimeout(() => {
      plug.classList.add('plug-password-wrapper_none')
    }, 500)
  }
  previewPhoto(file: File) {
    const reader: FileReader = new FileReader()
    reader.onload = () => {
      this.previewPhotoUrl = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  ngOnInit() {
    this.isMobile = this.platform.is('mobile')
    this.getUser()
    this.passwordResetForm = new FormGroup({
      old_password: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      new_password: new FormControl('', Validators.required),
      retry_password: new FormControl('', Validators.required),
    })
    this.resetForm = new FormGroup({
      new_name: new FormControl(this.user.name, [Validators.minLength(1)]),
    })
  }
}
