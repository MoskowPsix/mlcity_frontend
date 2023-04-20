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
  
  queryParams: IGetEventsAndSights = {}

  userID: number = 0
  eventTypes?: string
  sightTypes?: string
  dateStart?: string
  dateEnd?: string
  latitudeBounds?: string
  longitudeBounds?: string
  city?: string
  region?: string
  
  public paginationPublicEventsCityCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicEventsCityTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicEventsGeolocationCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicEventsGeolocationTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicSightsCityCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicSightsCityTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1) 

  public paginationPublicSightsGeolocationCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicSightsGeolocatioTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1) 


  constructor(private mapService: MapService, private filterService: FilterService, private userService: UserService) { }

  getUserID(){
    this.userService.getUser().pipe(
      tap((user) => user && user.id ? this.userID = user.id : this.userID = 0)
    ).subscribe().unsubscribe()
  }

  updateParams(){
    this.eventTypes = this.filterService.eventTypes.value.toString(),
    this.sightTypes = this.filterService.sightTypes.value.toString(),
    this.dateStart = this.filterService.startDate.value,
    this.dateEnd = this.filterService.endDate.value,
    this.latitudeBounds = this.mapService.radiusBoundsLats.value,
    this.longitudeBounds = this.mapService.radiusBoundsLongs.value,
    this.city = this.filterService.city.value,
    this.region = this.filterService.region.value,
    this.getUserID()
  }

  //Определяем и собираем запрос
  queryBuilder(page:string = 'eventsForMap'){
    this.updateParams()
    switch (page) {
      case 'eventsForMap':   //Главная страница - карта /home
        this.buildQueryEventsForMap()
        break;
      case 'eventsPublicForCityTab':  //Публичная страница мероприятий /events - вкладка по события городу
        this.buildQueryEventsPublicForCityTab()
        break;
      case 'eventsPublicForGeolocationTab': //Публичная страница мероприятий /events - вкладка события рядом
        this.buildQueryEventsPublicForGeolocationTab()
        break;
      case 'sightsForMap': //Главная страница - карта /home
        this.buildQuerySightsForMap()
        break;
      case 'sightsPublicForCityTab': //Публичная страница мероприятий /events - вкладка места по городу
        this.buildQuerySightsPublicForCityTab()
        break;
      case 'sightsPublicForGeolocationTab': //Публичная страница мероприятий /events - вкладка места рядом
        this.buildQuerySightsPublicForGeolocationTab()
        break;
      default:
        this.buildQueryDefault()
        break;
    }
    return this.queryParams
  }

  buildQueryDefault(){
    this.queryParams = {city: this.filterService.city.value, region: this.filterService.region.value}
  }

  buildQueryEventsForMap(){
    this.queryParams =  {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitudeBounds: this.latitudeBounds,
      longitudeBounds: this.longitudeBounds,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd
    }
  }
  
  buildQueryEventsPublicForCityTab(){
    this.queryParams =  {
      pagination: true,
      page: this.paginationPublicEventsCityCurrentPage.value,
      userId: this.userID,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      city: this.city,
      region: this.region,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd
    }  
  }

  buildQueryEventsPublicForGeolocationTab(){
    this.queryParams =  {
      pagination: true,
      page: this.paginationPublicEventsGeolocationCurrentPage.value,
      userId: this.userID,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      city: this.city,
      latitudeBounds: this.latitudeBounds,
      longitudeBounds: this.longitudeBounds,
      forEventPage: true,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd
    }  
  }

  buildQuerySightsForMap(){
    this.queryParams =  {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitudeBounds: this.latitudeBounds,
      longitudeBounds: this.longitudeBounds,
      sightTypes: this.sightTypes,
    }
  }

  buildQuerySightsPublicForCityTab(){
    this.queryParams =  {
      pagination: true,
      page: this.paginationPublicSightsCityCurrentPage.value,
      userId: this.userID,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      city: this.city,
      region: this.region,
      sightTypes: this.sightTypes,

    }  
  }

  buildQuerySightsPublicForGeolocationTab(){
    this.queryParams =  {
      pagination: true,
      page: this.paginationPublicSightsGeolocationCurrentPage.value,
      userId: this.userID,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      city: this.city,
      latitudeBounds: this.latitudeBounds,
      longitudeBounds: this.longitudeBounds,
      forEventPage: true,
      sightTypes: this.sightTypes,
    }  
  }

}
