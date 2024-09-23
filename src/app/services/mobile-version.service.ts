import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MobileVersionService {

  constructor(private http: HttpClient) { }

  getActualVersionFromServer() {
    return this.http.get(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/app`)
  }
}
