import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'
import { IUser } from '../models/user'

@Injectable({
  providedIn: 'root',
})
export class ViewsService {
  constructor(private http: HttpClient) {}
  addViewInEvent(id: string) {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}/view`)
  }
}
