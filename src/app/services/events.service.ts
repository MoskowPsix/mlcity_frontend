import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { tap, throwError } from 'rxjs'
import { IEvent } from '../models/event'
import { environment } from 'src/environments/environment'
import { IGetEventsAndSights } from '../models/getEventsAndSights'
import { UserService } from './user.service'
import { IPlace } from '../models/place'
import { IGetEventPlaces } from '../models/event-places'
import { options } from 'numeral'

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  // private userId?: Observable<number>

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.getUserId()
  }

  private user_id: number = 0

  getEventsForSearch(text: string, params: IGetEventsAndSights) {
    return this.http.post(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/search/text`, {
      ...params,
    })
  }

  getLikedUsersById(id: string) {
    return this.http.get(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}/favorites-users`)
  }
  getUserId() {
    const user = this.userService.getUserFromLocalStorage()
    if (user) {
      if (user.social_account) {
        this.user_id = user.id
      }
      this.user_id = user.id
    }
    // this.userService.getUserFromLocalStorage().pipe(
    //   //take(1),
    //   tap((user: any) => {
    //     console.log(user)
    //     if (user) {
    //       if (user.social_account) {
    //         this.vk_access_token = user.social_account.token
    //         this.vk_user_id = user.social_account.provider_id
    //       }
    //     } else {
    //       this.getAccessToken()
    //     }
    //   })
    // ).subscribe().unsubscribe();

    // this.userService.getUser().pipe(
    //   //take(1),
    //   tap((user: any) => {
    //     if (user) {
    //       this.user_id = user.id
    //     } else {
    //       this.getUserId()
    //     }
    //   })
    // ).subscribe().unsubscribe();
  }

  getEvents(params: IGetEventsAndSights) {
    //Получаем ивенты по заданным фильтрам (IGetEventsAndSights)
    return this.http.post<IEvent[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events`, {
      ...params,
    })
  }

  getEventPlaces(id?: number, params?: IGetEventsAndSights) {
    return this.http.get<IPlace[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}/places`, {
      params: { ...params },
    })
  }

  getEventById(id: number) {
    return this.http.get<IEvent>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}`)
  }

  getEventsFavorites(params: any) {
    this.getUserId()
    return this.http.get<IEvent[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/${this.user_id}/favorite-events`,
      { params: { ...params } },
    )
  }
  getEventsForUser(params: IGetEventsAndSights) {
    return this.http.get<IEvent[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events-for-author`, {
      params: { ...params },
    })
  }
  changeStatusEvent(id: number, status: number) {
    return this.http.post(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}/statuses/`, {
      status_id: status,
    })
  }

  toggleFavorite(event_id: number) {
    const params = {
      event_id: event_id,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/favorite-event-toggle`,
      params,
    )
  }

  checkFavorite(event_id: number) {
    return this.http.get<boolean>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${event_id}/check-user-favorite`,
    )
  }

  toggleLike(event_id: number) {
    const params = {
      event_id: event_id,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/like-event-toggle`,
      params,
    )
  }

  checkLiked(event_id: number) {
    return this.http.get<boolean>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${event_id}/check-user-liked`,
    )
  }

  updateEventVkLIkes(event_id: number, likes_count: number) {
    const params = {
      event_id: event_id,
      likes_count: likes_count,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/update-vk-likes`,
      params,
    )
  }

  //Установить отношение, отмечаем что юзер лайкнул эвент
  setEventUserLiked(event_id: number) {
    const params = {
      event_id: event_id,
      //user_id: this.userId
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/set-event-user-liked`,
      params,
    )
  }

  create(event: FormData) {
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data',
    })
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/create`, event, {
      headers,
    })
  }

  addView(id: number, time: number) {
    const params = {
      event_id: id,
      time: time,
    }
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/view`, params)
  }

  getOrganization(id: number) {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${id}/organization`)
  }

  private errorHandler(error: HttpErrorResponse) {
    //this.errorService.handle(error.message)
    return throwError(() => error.message)
  }
}
