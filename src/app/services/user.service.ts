import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { config } from 'process';

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

  changeName(data: FormData): Observable<any>{
    console.log(data.get('avatar'))
    console.log(data.get('new_name'))
    // return this.http.post(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/profile/users`,{'new_name':data.get('new_name'), 'avatar':data.get('avatar')})
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/profile/users`,data)

  }
}

