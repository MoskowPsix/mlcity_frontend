import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { IPlace } from '../models/place';


@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  constructor(
    private http: HttpClient,
  ) { }

  getPlaces() { //Получаем ивенты по заданным фильтрам (IGetEventsAndSights)

    return this.http.get<IPlace[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/places` )
    //return this.http.get<IPlsce[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events`, { params: {...params} } )
  }

}
