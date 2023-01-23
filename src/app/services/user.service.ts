import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { ISocialAccount } from '../models/social-account';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any

  constructor(private http: HttpClient) { }

  getUser() {
    return this.user
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}`)
  } 

  getSocialAccountByUserId(id: number): Observable<ISocialAccount> {
    return this.http.get<ISocialAccount>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}/social-account`)
  } 

  setUser(user: any) {
    this.user = []
    this.setUserToLocalStorage(user)
  } 
  

  setUserToLocalStorage(user: any) {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

   getUserFromLocalStorage() {
    return this.user = JSON.parse(localStorage.getItem('auth_user')  || 'null')
    //return this.user = localStorage.getItem('auth_user')
  }

  // Remove token
  removeUserFromLocalStorage() {
    localStorage.removeItem('auth_user')
    this.user = []
  }
}

