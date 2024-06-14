import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { Form } from '@angular/forms'

@Injectable({
  providedIn: 'root',
})
export class RecoveryPasswordService {
  constructor(private http: HttpClient) {}

  recoveryPassword(mail: string) {
    const params = {
      email: mail,
    }
    return this.http.get<string>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/recovery/password`,
      { params: params },
    )
  }

  newPassword(passwordForm: Form) {
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/recovery/password`,
      passwordForm,
    )
  }
}
