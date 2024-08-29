import { Injectable } from '@angular/core'
import { IOrganization } from '../models/organization'
import { environment } from 'src/environments/environment'
import { HttpClient, HttpParams } from '@angular/common/http'
import { UserService } from './user.service'

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  createOrganization(body: FormData) {
    // Создание организацию
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organizations`, body)
  }
  checkHasUserOrganization() {
    // Создание организацию
    return this.http.get<IOrganization[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/organizations/check`,
    )
  }

  // organizations/{organizationId}/events
  getOrganizationEvents(id: string) {
    // Получаем организации у сообщества
    return this.http.get<IOrganization[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organizations/${id}/events`,
    )
  }
  getOrganization(params: any) {
    // Получаем организации по заданным фильтрами
    return this.http.get<IOrganization[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organizations`, {
      params: params as HttpParams,
    })
  }
  getOrganizationById(id: string) {
    // Получаем организации по заданным фильтрами
    return this.http.get<IOrganization>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organizations/${id}`,
    )
  }

  getUserOrganizations() {
    // организации пользователя
    let user: any = this.userService.getUser()
    let userId = user.source.value.id
    return this.http.get<IOrganization[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/${userId}/organizations`,
    )
  }
}
