import { Injectable } from '@angular/core'
import { UserService } from './user.service'
import { environment } from 'src/environments/environment'
import { HttpClient } from '@angular/common/http'
@Injectable({
  providedIn: 'root',
})
export class RulesModalCheckService {
  userId: number = 0
  constructor(
    private userService: UserService,
    private http: HttpClient,
  ) {}

  user: any
  sightOrEvent: any
  getSightOrEvent(value: number) {
    this.sightOrEvent = value
  }

  getAgreements() {
    return this.http.get<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/agreements/${this.sightOrEvent}/check`,
    )
  }

  setAgreements(value: object) {
    return this.http.post(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/agreements/accept`,
      value,
    )
  }
}
