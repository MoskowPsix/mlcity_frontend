import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatusesService {

  constructor(private http: HttpClient) { }

  getStatuses() {
    return this.http.get<any>(`${environment.BASE_URL}:${environment.PORT}/api/statuses`)
  }
}
