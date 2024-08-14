import { Injectable } from '@angular/core'
import { IOrganisation } from '../models/organisation'
import { environment } from 'src/environments/environment'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) {}

  createOrganization(body: FormData) {
    //Получаем регио или город по id
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organization`, body)
  }
}
