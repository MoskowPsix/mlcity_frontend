import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http'
import {catchError, delay, Observable, retry, tap, throwError} from 'rxjs'
import {ErrorService} from './error.service'
import { IEvents } from '../models/events';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) {
  }

  events: IEvents[] = []

  getAll(): Observable<IEvents[]> {
    return this.http.get<IEvents[]>('https://fakestoreapi.com/products', {
      params: new HttpParams({
        fromObject: {limit: 15}
      })
    }).pipe(
      delay(200),
      retry(2),
      tap(events => this.events = events),
      catchError(this.errorHandler.bind(this))
    )
  }

  create(event: IEvents): Observable<IEvents> {
    return this.http.post<IEvents>('https://fakestoreapi.com/products', event)
      .pipe(
        tap(prod => this.events.push(prod))
      )
  }


  private errorHandler(error: HttpErrorResponse) {
    this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
