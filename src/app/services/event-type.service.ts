import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventTypeService {
  constructor(private http: HttpClient) {}

  getTypes() {
    return this.http.get<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/event-types`
    );
  }
}
