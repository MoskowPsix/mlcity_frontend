import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { ISocialAccount } from '../models/social-account';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public user:  BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(this.getUserFromLocalStorage())

  constructor(private http: HttpClient) { }

  getUser(): Observable<IUser | null> {
    return this.user.asObservable()
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/${id}`)
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
    return JSON.parse(localStorage.getItem('auth_user')  || 'null')
  }

  // Remove token
  removeUserFromLocalStorage() {
    localStorage.removeItem('auth_user')
    this.user.next(null)
  }
}

