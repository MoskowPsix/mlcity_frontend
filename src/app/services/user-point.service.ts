import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, catchError, EMPTY, of, Subject, takeUntil } from 'rxjs'
import { environment } from 'src/environments/environment'
import { serialize } from 'object-to-formdata'
import { AuthService } from './auth.service'
import { MapService } from './map.service'
import { FilterService } from './filter.service'
import { ToastService } from './toast.service'

@Injectable({
  providedIn: 'root',
})
export class UserPointService {
  private readonly destroy$ = new Subject<void>()

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private filtersService: FilterService,
    private mapService: MapService,
    private toastService: ToastService,
  ) {}

  public homeLatitude: BehaviorSubject<string> = new BehaviorSubject<string>('')
  public homeLongitude: BehaviorSubject<string> = new BehaviorSubject<string>('')

  getPoints() {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/point`)
  }
  createUserPoint(params: object) {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/point`, params)
  }
  deleteUserPoint(id: number) {
    return this.http.delete<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/point/${id}`)
  }
}
