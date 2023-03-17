import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import {Observable, tap, throwError, delay, retry, catchError} from 'rxjs'
import {ErrorService} from './error.service'
import { IEvents } from '../models/events';
import { environment } from 'src/environments/environment';
import { Statuses } from '../enums/statuses';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
  ) {}

  //events: IEvents[] = []
  city: string | null = 'Заречный'

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

  getLastPublish(page:number = 1, lat_coords:number[] = [], lon_coords:number[] = []) { //lat_coords и lon_coords массивы вида [56.843600, 95.843600]
    const params = {
      city: this.city,
      page: page,
      latitude: lat_coords,
      longitude:lon_coords
    } 
    return this.http.post<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/last`, params)
   // return this.http.get<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/${this.city}/${page}`)
  }

  getPublishByCoords(lat_coords:[], lon_coords:[]) {
    const params = {
      latitude: lat_coords,
      longitude:lon_coords
    } 
    return this.http.post<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/coords`, params)
  }

  setFavoritesIds(){
    const params = {} 
    return this.http.post<[]>(`${environment.BASE_URL}:${environment.PORT}/api/users/favorite-events-ids`,params)
  }

  toggleFavorite(event_id:number) {
    const params = {
      event_id:event_id
    } 
    return this.http.post<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/users/favorite-event-toggle`, params)
  }

  create(event: FormData) {
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/events/create`, event)
  }

  private errorHandler(error: HttpErrorResponse) {
    //this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
