import { Injectable } from '@angular/core';
import { tap, BehaviorSubject } from 'rxjs';
import { MapService } from './map.service';
import { FilterService } from './filter.service';
import { UserService } from 'src/app/services/user.service';
import { IGetEventsAndSights } from '../models/getEventsAndSights';
import { Statuses } from '../enums/statuses';

@Injectable({
  providedIn: 'root'
})
export class QueryBuilderService {

  isFilterSaved: number = 0
  userID: number = 0
  
  public paginationPublicEventsCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  public paginationPublicEventsTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1) 

  constructor(private mapService: MapService, private filterService: FilterService, private userService: UserService) { }

  getUserID(){
    this.userService.getUser().pipe(
      tap((user) => user && user.id ? this.userID = user.id : this.userID = 0)
    ).subscribe().unsubscribe()
  }

  //собираем запрос, при вызове указать с какой страницы вызов
  buidEventsQuery(page:string = 'map'): IGetEventsAndSights{
    let queryParams: IGetEventsAndSights = {}
    let isFilterSaved: number = this.filterService.saveFilters.value // смотрим сохраненены ли фильтры

    let eventTypes = this.filterService.eventTypes.value
    let dateStart = this.filterService.startDate.value
    let dateEnd = this.filterService.endDate.value
    let latitudeBounds = this.mapService.radiusBoundsLats.value
    let longitudeBounds = this.mapService.radiusBoundsLongs.value
    let city = this.filterService.city.value
    let region = this.filterService.region.value

    switch (page) {
      //Главная страница - карта /home
      case 'map':
        if (isFilterSaved === 1){ // если установлен фильтр    
          queryParams =  {
            statuses: [Statuses.publish].join(','),
            statusLast: true,
            latitudeBounds: latitudeBounds,
            longitudeBounds: longitudeBounds,
            eventTypes: eventTypes.join(','),
            dateStart: dateStart,
            dateEnd: dateEnd
          }
        } else {
          queryParams =  {
            statuses: [Statuses.publish].join(','),
            statusLast: true,
            latitudeBounds: latitudeBounds,
            longitudeBounds: longitudeBounds,
          }
        }
      
        break;

     //Публичная страница мероприятий /events
     case 'eventsPublic':
      this.getUserID()
      if (isFilterSaved === 1){ // если установлен фильтр    
        queryParams =  {
          pagination: true,
          page: this.paginationPublicEventsCurrentPage.value,
          userId: this.userID,
          favoriteUser: true,
          likedUser: true,
          statuses: [Statuses.publish].join(','),
          statusLast: true,
          city: city,
          region: region,
          latitudeBounds: latitudeBounds,
          longitudeBounds: longitudeBounds,
          forEventPage: true,
          eventTypes: eventTypes.join(','),
          dateStart: dateStart,
          dateEnd: dateEnd
        }
      } else {
        queryParams =  {
          pagination: true,
          page: this.paginationPublicEventsCurrentPage.value,
          userId: this.userID,
          favoriteUser: true,
          likedUser: true,
          statuses: [Statuses.publish].join(','),
          statusLast: true,
          city: city,
          region: region,
          latitudeBounds: latitudeBounds,
          longitudeBounds: longitudeBounds,
          forEventPage: true
        }
      }
    
      break;

      default:
        queryParams = {city: this.filterService.city.value, region: this.filterService.region.value}
        break;
    }

    return queryParams
  }

}
