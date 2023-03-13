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

  getPublish(): Observable<IEvents[]> {
    return  this.http.get<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish`).pipe(
      delay(200),
      retry(2),
      tap(events => this.events = events),
      catchError(this.errorHandler.bind(this))
    )
  }

  create(event: FormData) {
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/events/create`, event)
      // .pipe(
      //   tap(res => {
      //     console.log(res)
      //     // this.events.push(event)
      //   })
      // )
  }

  private errorHandler(error: HttpErrorResponse) {
    //this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
