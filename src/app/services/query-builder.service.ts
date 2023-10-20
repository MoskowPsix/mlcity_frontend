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

  queryParams: IGetEventsAndSights = {}

  userID: number = 0
  eventTypes?: string
  sightTypes?: string
  dateStart?: string
  dateEnd?: string
  latitude?: number
  longitude?: number
  locationId?: number
  radius?: number
  
  public paginationPublicEventsCityCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicEventsCityTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicEventsGeolocationCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicEventsGeolocationTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicEventsFavoritesCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 

  public paginationPublicSightsCityCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicSightsCityTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1) 

  public paginationPublicSightsGeolocationCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  //public paginationPublicSightsGeolocatioTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1) 
  
  public paginationPublicSightsFavoritesCurrentPage: BehaviorSubject<number> = new BehaviorSubject<number>(1) 


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
    this.latitude = this.mapService.circleCenterLatitude.value,
    this.longitude = this.mapService.circleCenterLongitude.value,
    this.locationId = this.filterService.locationId.value,
    this.radius = parseInt(this.filterService.radius.value)
    this.getUserID()
  }

  //Определяем и собираем запрос
  queryBuilder(page:string = 'eventsForMap'){
    this.updateParams()
    switch (page) {
      case 'placesForMap':   //Главная страница - карта /home
      this.buildQueryPlacesForMap()
      break;
      case 'eventsForMap':   //Главная страница - карта /home
        this.buildQueryEventsForMap()
        break;
      case 'eventsFavorites':   //Страница избранного -  /cabinet/favorites
        this.buildQueryEventsFavorites()
        break;
      case 'eventsPublicForCityTab':  //Публичная страница мероприятий /events - вкладка по события городу
        this.buildQueryEventsPublicForCityTab()
        break;
      case 'eventsPublicForGeolocationTab': //Публичная страница мероприятий /events - вкладка события рядом
        this.buildQueryEventsPublicForGeolocationTab()
        break;
      case 'sightsFavorites':   //Страница избранного -  /cabinet/favorites
        this.buildQuerySightsFavorites()
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
    this.queryParams = {
      locationId: this.filterService.locationId.value
    }
  }

  buildQueryEventsFavorites() {
    this.queryParams =  {
      page: this.paginationPublicEventsFavoritesCurrentPage.value,
      userId: this.userID,
      likedUser: true,
      favoriteUser: true
    }  
  }
  buildQueryPlacesForMap() {
    this.queryParams =  {
      //statuses: [Statuses.publish].join(','),
      //statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      //eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      radius: this.radius,
    }
  }
  buildQueryEventsForMap(){
    this.queryParams =  {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      radius: this.radius,
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
      locationId: this.locationId,
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
      locationId: this.locationId,
      latitude: this.latitude,
      longitude: this.longitude,
      radius: this.radius,
      //forEventPage: true,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd
    }  
  }

  buildQuerySightsFavorites() {
    this.queryParams =  {
      page: this.paginationPublicSightsFavoritesCurrentPage.value,
      likedUser: true,
      favoriteUser: true
    }  
  }

  buildQuerySightsForMap(){
    this.queryParams =  {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      radius: this.radius,
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
      locationId: this.locationId,
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
      locationId: this.locationId,
      latitude: this.latitude,
      longitude: this.longitude,
      radius: this.radius,
      //forEventPage: true,
      sightTypes: this.sightTypes,
    }  
  }

}
