import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs'
import { environment } from 'src/environments/environment';
import { ISight } from '../models/sight';
import { IGetEventsAndSights } from '../models/getEventsAndSights';

@Injectable({
  providedIn: 'root'
})
export class SightsService {

  constructor(private http: HttpClient) { }

  getSights(params: IGetEventsAndSights) { //Получаем достопримечательности по заданным фильтрам (IGetEventsAndSights)
    return this.http.get<ISight[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights`, { params: {...params} } )
  }

  getSightById(id: number) {
    return this.http.get<ISight>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${id}`)
  } 

  checkLiked(sight_id:number){
    return this.http.get<boolean>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${sight_id}/check-user-liked`)
  }

  checkFavorite(sight_id:number){
    return this.http.get<boolean>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/${sight_id}/check-user-favorite`)
  }

  toggleLike(sight_id:number) {
    const params = {
      sight_id:sight_id
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/like-sight-toggle`, params)
  }

  toggleFavorite(sight_id:number) {
    const params = {
      sight_id:sight_id
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/favorite-sight-toggle`, params)
  }

  updateSightVkLIkes(sight_id:number, likes_count:number){
    const params = {
      sight_id: sight_id,
      likes_count: likes_count
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/update-vk-likes`, params)
  }

  //Установить отношение, отмечаем что юзер лайкнул место
  setSightUserLiked(sight_id:number){
    const params = {
      sight_id: sight_id,
    } 
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/set-sight-user-liked`, params)
  }

  create(sight: FormData) {
    return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights/create`, sight)
  }

  private errorHandler(error: HttpErrorResponse) {
    return throwError(() => error.message)
  }
  
}
