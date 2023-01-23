import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  private getCSRF(): Observable<string> {
    return this.http.get<string>(`${environment.BASE_URL}:${environment.PORT}/sanctum/csrf-cookie`)
      // .pipe(
      //   tap(res => {
      //     console.log(res)
      //     localStorage.setItem('XSRF-TOKEN', res);
      //   })
      // );
  }

  login(user: IUser): Observable<IUser> {
    return this.getCSRF().pipe(
      mergeMap(res => {
        return this.http.post<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/login`, user)
      })
    )
  }
  
}