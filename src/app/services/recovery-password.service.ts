import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'

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
}
