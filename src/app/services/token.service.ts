import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  setToken(token: any) {
    localStorage.setItem('auth_token', JSON.stringify(token))
  }

  getToken() {
    return JSON.parse(localStorage.getItem('auth_token') || 'null')
    //return localStorage.getItem('auth_token')
  }
  
  // Remove token
  removeToken() {
    localStorage.removeItem('auth_token')
  }
}
