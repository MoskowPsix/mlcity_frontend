import { Injectable } from '@angular/core'
import { IOrganization } from '../models/organization'
import { environment } from 'src/environments/environment'
import { HttpClient, HttpParams } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) {}

  createOrganization(body: FormData) {
    // Создание организацию
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organization`, body)
  }
  getOrganization(params: IOrganization) {
    // Получаем организации по заданным фильтрами
    return this.http.get<IOrganization[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organization`, {
      params: params as HttpParams,
    })
  }
}
