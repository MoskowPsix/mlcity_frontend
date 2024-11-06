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

@Injectable()
export class AuthService {
  authenticationState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  //authenticationState: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  isAuthEmail(): boolean {
    let user = this.userService.getUserFromLocalStorage()
    return user?.email_verified_at ? true : false
  }
  isAuthenticated(): boolean {
    let token = this.tokenService.getToken()
    let user = this.userService.getUserFromLocalStorage()
    if (token && user) {
      this.authenticationState.value === false ? this.authenticationState.next(true) : null
      return true
    } else {
      this.authenticationState.value === true ? this.authenticationState.next(false) : null
      return false
    }

    // return token && user ? true : false
  }

  getAuthState() {
    this.isAuthenticated()
    return this.authenticationState.value
    // console.log('this.authenticationState '+ this.authenticationState)
    // return this.authenticationState

    // return this.authenticationState.subscribe(state => {
    //   return state
    // })
  }

  private getCSRF(): Observable<string> {
    return this.http.get<string>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/sanctum/csrf-cookie`)
  }

  login(user: IUser): Observable<IUser> {
    return this.getCSRF().pipe(
      mergeMap((res) => {
        return this.http.post<IUser>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/login`, user)
      }),
    )
  }
  loginApple(data: any) {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/social-auth/apple`, data)
  }
  register(data: any) {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/register`, data)
  }

  registerGuest() {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/register/guest`, {})
  }

  setPassword(pass: any[]): Observable<IUser> {
    const params = pass
    return this.getCSRF().pipe(
      mergeMap((res) => {
        return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/set_password`, params)
      }),
    )
  }

  logout() {
    this.tokenService.removeToken()
    this.userService.removeUserFromLocalStorage()
    this.authenticationState.next(false)
    this.router.navigate(['login'])
  }

  resetPassword(data: PasswordReset) {
    return this.http.put<PasswordReset>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/reset_password`,
      data,
    )
  }

  checkName(name: string) {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/name/check/${name}`)
  }

  checkEmail(mail: string) {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/email/check/${mail}`)
  }

  checkNumber(number: string) {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/number/check/${number}`)
  }

  verfiEmail(number: number) {
    const param = {
      code: number,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/verificationUserEmail`,
      param,
    )
  }
  getEmailCode() {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/verificationEmail`, {})
  }

  editEmailNotVerification(email: string) {
    return this.http.put<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/email`, email)
  }
}
