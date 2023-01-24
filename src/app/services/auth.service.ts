import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { TokenService } from './token.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

  authenticationState = new BehaviorSubject(false);

  constructor(private http: HttpClient, private tokenService: TokenService, private userService: UserService) { }

  private getCSRF(): Observable<string> {
    return this.http.get<string>(`${environment.BASE_URL}:${environment.PORT}/sanctum/csrf-cookie`)
      // .pipe(
      //   tap(res => {
      //     console.log(res)
      //     localStorage.setItem('XSRF-TOKEN', res);
      //   })
      // );
  }

  isAuthenticated() {
    let token = this.tokenService.getToken()
    let user = this.userService.getUserFromLocalStorage()

    if (token && user){
      return this.authenticationState.next(true)
      //return true
    } else {
      return this.authenticationState.next(false)
      //return false
    } 
    // return token && user ? true : false
  }

  getAuthState(){
    this.isAuthenticated()
    return this.authenticationState.value
  }

  login(user: IUser): Observable<IUser> {
    return this.getCSRF().pipe(
      mergeMap(res => {
        return this.http.post<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/login`, user)
      })
    )
  }

  logout() {
    this.tokenService.removeToken()
    this.userService.removeUserFromLocalStorage()
    this.authenticationState.next(false)
  }
  
}