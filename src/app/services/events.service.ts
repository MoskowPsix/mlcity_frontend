import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http'
import {Observable, tap, throwError, delay, retry, catchError} from 'rxjs'
import {ErrorService} from './error.service'
import { IEvent } from '../models/events';
import { environment } from 'src/environments/environment';
import { Statuses } from '../enums/statuses';
import { UserService } from './user.service';
import { IUser } from '../models/user';
import { IGetEvents } from '../models/getEvents';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  // private userId?: Observable<number>

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private errorService: ErrorService,
  ) {
    // this.getAuthUSerID()
  }

  // getAuthUSerID(){
  //   this.userService.getUser().pipe(
  //     //take(1),
  //     tap((user: any) => {
  //       if (user)
  //       this.userId = user.id
  //     }),
  //   ).subscribe().unsubscribe();    
  // }

  getEvents(params: IGetEvents) { //Получаем ивенты по заданным фильтрам (IGetEvents)
    return this.http.get<IEvent[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events`, { params: {...params} } )
  }

  getEventById(id: number) {
    return this.http.get<IEvent>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}`)
  } 

  toggleFavorite(event_id:number) {
    const params = {
      event_id:event_id
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/favorite-event-toggle`, params)
  }

  checkFavorite(event_id:number){
    return this.http.get<boolean>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${event_id}/check-user-favorite`)
  }

  toggleLike(event_id:number) {
    const params = {
      event_id:event_id
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/like-event-toggle`, params)
  }

  checkLiked(event_id:number){
    return this.http.get<boolean>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${event_id}/check-user-liked`)
  }

  updateEventVkLIkes(event_id:number, likes_count:number){
    const params = {
      event_id: event_id,
      likes_count: likes_count
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/update-vk-likes`, params)
  }

  //Установить отношение, отмечаем что юзер лайкнул эвент
  setEventUserLiked(event_id:number){
    const params = {
      event_id: event_id,
      //user_id: this.userId
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/set-event-user-liked`, params)
  }

  create(event: FormData) {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/create`, event)
  }

  private errorHandler(error: HttpErrorResponse) {
    //this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
