import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import {Observable, tap, throwError, delay, retry, catchError} from 'rxjs'
import {ErrorService} from './error.service'
import { IEvent } from '../models/events';
import { environment } from 'src/environments/environment';
import { Statuses } from '../enums/statuses';
import { UserService } from './user.service';
import { IUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  //events: IEvents[] = []
  city: string | null = 'Заречный'
  private userId: number = 0

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private errorService: ErrorService,
  ) {
    this.userService.getUser().pipe(
      tap((user) => user && user.id ? this.userId = user.id : this.userId = 0)
    ).subscribe().unsubscribe() 
  }

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
      longitude:lon_coords,
      user_id: this.userId
    } 
    return this.http.post<IEvent[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/last`, params)
   // return this.http.get<IEvents[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/${this.city}/${page}`)
  }

  getPublishByCoords(lat_coords:any, lon_coords:any) {
    const params = {
      latitude: lat_coords,
      longitude:lon_coords,
      user_id: this.userId
    } 
    return this.http.post<IEvent[]>(`${environment.BASE_URL}:${environment.PORT}/api/events/publish/coords`, params)
  }

  toggleFavorite(event_id:number) {
    const params = {
      event_id:event_id
    } 
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/users/favorite-event-toggle`, params)
  }

  toggleLike(event_id:number) {
    const params = {
      event_id:event_id
    } 
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/users/like-event-toggle`, params)
  }

  updateEventVkLIkes(event_id:number, likes_count:number){
    const params = {
      event_id: event_id,
      likes_count: likes_count
    } 
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/events/update-vk-likes`, params)
  }

  //Установить отношение, отмечаем что юзер лайкнул эвент
  setEventUserLiked(event_id:number){
    const params = {
      event_id: event_id,
      //user_id: this.userId
    } 
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/events/set-event-user-liked`, params)
  }

  create(event: FormData) {
    return this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/events/create`, event)
  }

  private errorHandler(error: HttpErrorResponse) {
    //this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
