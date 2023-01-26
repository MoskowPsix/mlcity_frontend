import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { ISocialAccount } from '../models/social-account';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user:  BehaviorSubject<IUser | null> = new BehaviorSubject(this.getUserFromLocalStorage())


  constructor(private http: HttpClient) { }

  getUser() {
    return this.user.value
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}`)
  } 

  getSocialAccountByUserId(id: number): Observable<ISocialAccount> {
    return this.http.get<ISocialAccount>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}/social-account`)
  } 

  setUser(user: IUser) {
    //this.user.value = []
    this.user.next(user)
    this.setUserToLocalStorage(user)
  } 
  

  setUserToLocalStorage(user: IUser) {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

   getUserFromLocalStorage() {
   // return this.user.next(JSON.parse(localStorage.getItem('auth_user')  || 'null'))
    return JSON.parse(localStorage.getItem('auth_user')  || 'null')
    //return this.user = localStorage.getItem('auth_user')
  }

  // Remove token
  removeUserFromLocalStorage() {
    localStorage.removeItem('auth_user')
    this.user.next(null)
    //this.user = []
  }
}

