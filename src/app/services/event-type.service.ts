import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {

  constructor(private http: HttpClient) { }

  geTypes() {
    return this.http.get<any>(`${environment.BASE_URL}:${environment.PORT}/api/event-types`)
  }
}
