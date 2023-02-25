import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SightTypeService {

  constructor(private http: HttpClient) { }

  geTypes() {
    return this.http.get<any>(`${environment.BASE_URL}:${environment.PORT}/api/sight-types`)
  }
  
}
