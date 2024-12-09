import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class SightTypeService {
  constructor(private http: HttpClient) {}
  types: any[] = []
  getTypes() {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sight-types`)
  }
}
