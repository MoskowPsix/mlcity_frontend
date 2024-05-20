import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, mergeMap, BehaviorSubject, ReplaySubject, tap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { IUser } from '../models/user'
import { ToastService } from './toast.service'
import { TokenService } from './token.service'
import { UserService } from './user.service'
import { MessagesAuth } from '../enums/messages-auth'
import { PasswordReset } from '../models/password-reset'
import { QueryBuilderService } from './query-builder.service'

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  constructor(private http: HttpClient) {}
  sendMailSupport(param: any) {
    const params = {
      email: param.email,
      text: param.text,
      name: param.name,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/feedback/user`,
      params,
    )
  }
}
