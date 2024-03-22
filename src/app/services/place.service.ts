import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { IPlace } from '../models/place'
import { IGetEventsAndSights } from '../models/getEventsAndSights'

@Injectable({
  providedIn: 'root',
})
export class PlaceService {
  constructor(private http: HttpClient) {}

  getPlaces(params: any) {
    //Получаем метки по заданным фильтрам

    return this.http.get<IPlace[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/places`,
      { params: { ...params } },
    )
    //return this.http.get<IPlsce[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events`, { params: {...params} } )
  }

  getPlaceById(id: number) {
    return this.http.get<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/places/${id}`,
    )
  }

  getSeanses(id: number) {
    return this.http.get<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/places/${id}/seances`,
    )
  }
}
