import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import {Observable, tap, throwError, delay, retry, catchError} from 'rxjs'
import {ErrorService} from './error.service'
import { IEvents } from '../models/events';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) {}

  events: IEvents[] = []
  city: string = '*'

  // getAll(): Observable<IEvents[]> {
  //   return this.http.get<IEvents[]>('https://fakestoreapi.com/products', {
  //     params: new HttpParams({
  //       fromObject: {limit: 15}
  //     })
  //   }).pipe(
  //     delay(200),
  //     retry(2),
  //     tap(events => this.events = events),
  //     catchError(this.errorHandler.bind(this))
  //   )
  // }

  getPublishByCity(page:number = 1) {
    return this.http.get<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/${this.city}/${page}`)
  }

  getPublishByCoords(lat_coords:[], lon_coords:[]) {
    return this.http.get<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events//map/${lat_coords}/${lon_coords}`)
  }

  create(event: FormData) {
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/events/create`, event)
  }

  private errorHandler(error: HttpErrorResponse) {
    //this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
