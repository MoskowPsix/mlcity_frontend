import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any

  constructor(private http: HttpClient) { }

  getUser() {
    return this.user
  }

  setUserById(id: number) {
    this.user = this.http.get(`${environment.BASE_URL}:${environment.PORT}/users/${id}`)
    this.setUserToLocalStorage(this.user)
  } 

  setUser(user: any) {
    this.user = user
    this.setUserToLocalStorage(user)
  } 

  setUserToLocalStorage(user: any) {
    localStorage.setItem('auth_user', user)
  }

   getUserFromLocalStorage() {
    this.user = localStorage.getItem('auth_user')
  }

  // Remove token
  removeUserFromLocalStorage() {
    localStorage.removeItem('auth_user')
    this.user = []
  }
}
