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
    this.http.get(`${environment.BASE_URL}:${environment.PORT}/users/${id}`).subscribe(user => {
      this.user = user;
      this.setUserToLocalStorage(this.user);
    });
  } 

  setUser(user: any) {
    this.user = []
    this.setUserToLocalStorage(user)
  } 
  

  setUserToLocalStorage(user: any) {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

   getUserFromLocalStorage() {
    this.user = JSON.parse(localStorage.getItem('auth_user')  || '[]')
  }

  // Remove token
  removeUserFromLocalStorage() {
    localStorage.removeItem('auth_user')
    this.user = []
  }
}

