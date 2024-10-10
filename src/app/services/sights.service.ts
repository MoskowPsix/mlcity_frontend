import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { tap, throwError } from 'rxjs'
import { environment } from 'src/environments/environment'
import { ISight } from '../models/sight'
import { IGetEventsAndSights } from '../models/getEventsAndSights'
import { UserService } from './user.service'
import { IEvent } from '../models/event'

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.getUserId()
  }

  private user_id: number = 0

  getUserId() {
    const user = this.userService.getUserFromLocalStorage()
    if (user) {
      if (user.social_account) {
        this.user_id = user.id
      }
      this.user_id = user.id
    }
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

  getSights(params: IGetEventsAndSights) {
    //Получаем достопримечательности по заданным фильтрам (IGetEventsAndSights)
    return this.http.get<ISight[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights`, {
      params: { ...params },
    })
  }
  getSightsForMap(params: IGetEventsAndSights) {
    return this.http.get<any[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights-for-map`, {
      params: { ...params },
    })
  }

  getSightById(id: number) {
    return this.http.get<ISight>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${id}`)
  }
  changeStatusSight(id: number, status: number) {
    return this.http.post(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${id}/statuses/`, {
      status_id: status,
    })
  }
  getEventInSight(id: number, params?: any) {
    return this.http.get<IEvent>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${id}/events`, {
      params: { ...params },
    })
  }

  getSightsFavorites(params: any) {
    //Получаем ивенты по заданным фильтрам (IGetEventsAndSights)
    this.getUserId()
    return this.http.get<ISight[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/${this.user_id}/favorite-sights`,
      { params: { ...params } },
    )
  }
  getSightsForUser(params: IGetEventsAndSights) {
    //Получаем достопримечательности по заданным фильтрам (IGetEventsAndSights)
    return this.http.get<ISight[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights-for-author`, {
      params: { ...params },
    })
  }

  deleteSight(id: number) {
    return this.http.delete(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/organizations/${id}`)
  }

  checkLiked(sight_id: number) {
    return this.http.get<boolean>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${sight_id}/check-user-liked`,
    )
  }

  checkFavorite(sight_id: number) {
    return this.http.get<boolean>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${sight_id}/check-user-favorite`,
    )
  }

  toggleLike(sight_id: number) {
    const params = {
      sight_id: sight_id,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/like-sight-toggle`,
      params,
    )
  }

  toggleFavorite(sight_id: number) {
    const params = {
      sight_id: sight_id,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/favorite-sight-toggle`,
      params,
    )
  }

  updateSightVkLIkes(sight_id: number, likes_count: number) {
    const params = {
      sight_id: sight_id,
      likes_count: likes_count,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/update-vk-likes`,
      params,
    )
  }

  //Установить отношение, отмечаем что юзер лайкнул место
  setSightUserLiked(sight_id: number) {
    const params = {
      sight_id: sight_id,
    }
    return this.http.post<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/set-sight-user-liked`,
      params,
    )
  }

  create(sight: FormData) {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/create`, sight)
  }

  addView(id: number, time: number) {
    const params = {
      sight_id: id,
      time: time,
    }
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/view`, params)
  }

  private errorHandler(error: HttpErrorResponse) {
    return throwError(() => error.message)
  }
}
