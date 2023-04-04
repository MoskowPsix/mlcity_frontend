import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IEvent } from '../models/events';
import { IGetEventsAndSights } from '../models/getEventsAndSights';

@Injectable({
  providedIn: 'root'
})
export class SightsService {

  constructor(private http: HttpClient) { }

  getSights(params: IGetEventsAndSights) { //Получаем достопримечательности по заданным фильтрам (IGetEventsAndSights)
    return this.http.get<IEvent[]>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/sights`, { params: {...params} } )
  }
}
