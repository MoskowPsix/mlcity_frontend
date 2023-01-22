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
    return JSON.parse(localStorage.getItem('auth_token') || '[]')
  }

  // Verify the token
  isValidToken() {
    const token = this.getToken()
    token ? true : false;
  }

  // User state based on valid token
  isLoggedIn() {
    return this.isValidToken()
  }
  
  // Remove token
  removeToken() {
    localStorage.removeItem('auth_token')
  }
}
