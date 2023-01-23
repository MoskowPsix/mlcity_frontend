import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { TokenService } from './token.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

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

  isAuthenticated(): boolean {
    let token = this.tokenService.getToken()
    let user = this.userService.getUserFromLocalStorage()
    console.log('token      ' + token)
    console.log('user      ' + user)
    if (token && user) {
      console.log('isAuthenticated true');
      return true
    } else {
      console.log('isAuthenticated false');
      return false
    }
    // console.log('isAuthenticated =  token' + token && user ? true : false)
    // return token && user ? true : false;
  }

  login(user: IUser): Observable<IUser> {
    return this.getCSRF().pipe(
      mergeMap(res => {
        return this.http.post<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/login`, user)
      })
    )
  }
  
}