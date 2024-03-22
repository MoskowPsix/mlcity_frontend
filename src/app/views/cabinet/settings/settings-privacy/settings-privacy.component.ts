import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, of, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-settings-privacy',
  templateUrl: './settings-privacy.component.html',
  styleUrls: ['./settings-privacy.component.scss'],
})
export class SettingsPrivacyComponent implements OnInit {
  passwordResetForm: FormGroup = new FormGroup({});
  private readonly destroy$ = new Subject<void>();

  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  onSubmit() {
    if (this.passwordResetForm.status == 'VALID') {
      if (
        this.passwordResetForm.value.new_password !=
        this.passwordResetForm.value.retry_password
      ) {
        this.toastService.showToast('Пароли не совпадают', 'danger');
      } else {
        this.loadingService.showLoading();
        this.authService
          .resetPassword(this.passwordResetForm.value)
          .pipe(
            takeUntil(this.destroy$),
            catchError(err => {
              if (err.status == 401) {
                this.authService.logout();
              }
              this.loadingService.hideLoading();
              this.toastService.showToast(
                'Возможно вы ввели не верный текущий пароль',
                'danger'
              );
              return of(EMPTY);
            })
          )
          .subscribe((response: any) => {
            this.loadingService.hideLoading();
            if (response.status == 'success') {
              this.toastService.showToast('Пароль изменен', 'success');
            }
          });
      }
    }
  }
  ngOnInit() {
    this.passwordResetForm = new FormGroup({
      old_password: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      new_password: new FormControl('', Validators.required),
      retry_password: new FormControl('', Validators.required),
    });
  }
}
