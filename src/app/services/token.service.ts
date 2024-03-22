import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor() {}

  setToken(token: any) {
    //localStorage.setItem('X-XSRF-TOKEN', JSON.stringify(token))
    localStorage.setItem('auth-token', token);
  }

  getToken() {
    //return JSON.parse(localStorage.getItem('X-XSRF-TOKEN') || 'null')
    return localStorage.getItem('auth-token');
  }

  // Remove token
  removeToken() {
    localStorage.removeItem('auth-token');
  }
}
