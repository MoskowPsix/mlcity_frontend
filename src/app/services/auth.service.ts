import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private getCRSF():Observable<any> {
    return this.http.get<any>(`${environment.BASE_URL}:${environment.PORT}/sanctum/csrf-cookie`)
  }

  login(user: User): Observable<User> {
    return this.getCRSF().pipe(
      mergeMap(res => {
        return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/login`, user)
      })
    )
  }
  
}