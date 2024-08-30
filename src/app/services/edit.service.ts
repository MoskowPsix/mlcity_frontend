import { Injectable } from '@angular/core'
import { IEvent } from '../models/event'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: 'root',
})
export class EditService {
  constructor(private http: HttpClient) {}

  sendEditEvent(event: any) {
    return this.http.post(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/history-content`, event)
  }
  sendEditSight(event: any) {
    return this.http.post(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/history-content`, event)
  }
}
