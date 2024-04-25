import { Injectable } from '@angular/core';
import { tap, BehaviorSubject } from 'rxjs';
import { MapService } from './map.service';
import { FilterService } from './filter.service';
import { UserService } from 'src/app/services/user.service';
import { IGetEventsAndSights } from '../models/getEventsAndSights';
import { Statuses } from '../enums/statuses';

@Injectable({
  providedIn: 'root',
})
export class QueryBuilderService {
  queryParams: IGetEventsAndSights = {};

  userID: number = 0;
  eventTypes?: string;
  sightTypes?: string;
  dateStart?: string;
  dateEnd?: string;
  latitude?: number;
  longitude?: number;
  locationId?: number;
  radius?: number;

  public paginationPublicEventsCityCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  //public paginationPublicEventsCityTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicSightsRadiusPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public paginationPublicEventsRadiusPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  // public paginationPublicEventsGeolocationCurrentPage!: BehaviorSubject<string>
  //public paginationPublicEventsGeolocationTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicEventsFavoritesCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public paginationPublicSightsCityCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  //public paginationPublicSightsCityTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicEventsForAuthorCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public paginataionPublicEventPlacesCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public paginationPublicSightsForAuthorCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  // public paginationPublicSightsGeolocationCurrentPage!: BehaviorSubject<string>
  //public paginationPublicSightsGeolocatioTotalPages: BehaviorSubject<number> = new BehaviorSubject<number>(1)

  public paginationPublicSightsFavoritesCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public paginationEventsInSightCurrentPage: BehaviorSubject<string> = new BehaviorSubject<string>('')

  public paginationPublicEventsForTapeCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public paginationPublicSightsForTapeCurrentPage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  constructor(
    private mapService: MapService,
    private filterService: FilterService,
    private userService: UserService
  ) {}

  getUserID() {
    this.userService
      .getUser()
      .pipe(
        tap(user =>
          user && user.id ? (this.userID = user.id) : (this.userID = 0)
        )
      )
      .subscribe()
      .unsubscribe();
  }

  updateParams() {
    (this.eventTypes = this.filterService.eventTypes.value.toString()),
      (this.sightTypes = this.filterService.sightTypes.value.toString()),
      (this.dateStart = this.filterService.startDate.value),
      (this.dateEnd = this.filterService.endDate.value),
      (this.latitude = this.mapService.circleCenterLatitude.value),
      (this.longitude = this.mapService.circleCenterLongitude.value),
      (this.locationId = this.filterService.locationId.value),
      (this.radius = parseInt(this.filterService.radius.value));
    this.getUserID();
  }

  //Определяем и собираем запрос
  queryBuilder(page: string = 'eventsForMap') {
    this.updateParams();
    switch (page) {
      case 'placesForMap': //Главная страница - карта /home
        this.buildQueryPlacesForMap();
        break;
      case 'eventsForMap': //Главная страница - карта /home
        this.buildQueryEventsForMap();
        break;
      case 'eventsForTape': //Лента ивентов - /events
        this.buildQueryEventsForTape();
        break;
      case 'sightsForTape': // Лента мест - /sights
        this.buildQuerySightsForTape();
        break;
      case 'eventsFavorites': //Страница избранного -  /cabinet/favorites
        this.buildQueryEventsFavorites();
        break;
      case 'eventsPublicForCityTab': //Публичная страница мероприятий /events - вкладка по события городу
        this.buildQueryEventsPublicForCityTab();
        break;
      case 'eventsModalRadiusForMap': //Публичная страница мероприятий /events - вкладка по события городу
        this.buildQueryEventsModalRadiusForMap();
        break;
      // case 'eventsPublicForGeolocationTab': //Публичная страница мероприятий /events - вкладка события рядом
      //   this.buildQueryEventsPublicForGeolocationTab()
      //   break;
      case 'sightsFavorites': //Страница избранного -  /cabinet/favorites
        this.buildQuerySightsFavorites();
        break;
      case 'sightsForMap': //Главная страница - карта /home
        this.buildQuerySightsForMap();
        break;
      case 'sightsPublicForCityTab': //Публичная страница мероприятий /events - вкладка места по городу
        this.buildQuerySightsPublicForCityTab();
        break;
      case 'eventsPublicForAuthor': //Публичная страница мероприятий /events - вкладка места рядом
        this.buildQueryEventsPublicForAuthor();
        break;
      case 'sightsPublicForAuthor': //Публичная страница мероприятий /events - вкладка места рядом
        this.buildQuerySightsPublicForAuthor();
        break;
      case 'eventPlaces':
        this.buildQueryEventPlaces();
        break;
      case 'sightsModalRadiusForMap': //Публичная страница мероприятий /events - вкладка по события городу
        this.buildQuerySightsModalRadiusForMap();
        break;
      case "buildQueryEventsInSight":
        this.buildQueryEventsInSight()
        break
      default:
        this.buildQueryDefault();
        break;
    }
    return this.queryParams;
  }

  buildQueryEventsForTape() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      radius: this.radius,
      page: this.paginationPublicEventsForTapeCurrentPage.value,
    };
  }

  buildQuerySightsForTape() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      radius: this.radius,
      sightTypes: this.sightTypes,
      page: this.paginationPublicSightsForTapeCurrentPage.value,
    };
  }

  buildQueryEventsPublicForAuthor() {
    this.queryParams = {
      page: this.paginationPublicEventsForAuthorCurrentPage.value,
    };
  }
  buildQueryEventsInSight(){
    this.queryParams = {
      page: this.paginationEventsInSightCurrentPage.value
    }
  }
  buildQuerySightsPublicForAuthor() {
    this.queryParams = {
      page: this.paginationPublicSightsForAuthorCurrentPage.value,
    };
  }

  buildQueryDefault() {
    this.queryParams = {
      locationId: this.filterService.locationId.value,
    };
  }

  buildQueryEventsFavorites() {
    this.queryParams = {
      page: this.paginationPublicEventsFavoritesCurrentPage.value,
      userId: this.userID,
      likedUser: true,
      favoriteUser: true,
    };
  }
  buildQueryPlacesForMap() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      radius: this.radius,
    };


  }

  buildQueryEventsForMap() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      radius: this.radius,
    };
  }

  buildQueryEventsModalRadiusForMap() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      radius: this.radius,
      page: this.paginationPublicEventsRadiusPage.value,
    };
  }

  buildQuerySightsModalRadiusForMap() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      sightTypes: this.sightTypes,
      radius: this.radius,
      page: this.paginationPublicSightsRadiusPage.value,
    };
  }

  buildQueryEventsPublicForCityTab() {
    this.queryParams = {
      page: this.paginationPublicEventsCityCurrentPage.value,
      userId: this.userID,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      locationId: this.locationId,
      eventTypes: this.eventTypes,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
    };
  }

  buildQueryEventPlaces() {
    this.queryParams = {
      page: this.paginataionPublicEventPlacesCurrentPage.value,
    };
  }

  // buildQueryEventsPublicForGeolocationTab(){
  //   this.queryParams =  {
  //     pagination: true,
  //     page: this.paginationPublicEventsGeolocationCurrentPage.value,
  //     userId: this.userID,
  //     favoriteUser: true,
  //     likedUser: true,
  //     statuses: [Statuses.publish].join(','),
  //     statusLast: true,
  //     locationId: this.locationId,
  //     latitude: this.latitude,
  //     longitude: this.longitude,
  //     radius: this.radius,
  //     //forEventPage: true,
  //     eventTypes: this.eventTypes,
  //     dateStart: this.dateStart,
  //     dateEnd: this.dateEnd
  //   }
  // }

  buildQuerySightsFavorites() {
    this.queryParams = {
      page: this.paginationPublicSightsFavoritesCurrentPage.value,
      likedUser: true,
      favoriteUser: true,
    };
  }

  buildQuerySightsForMap() {
    this.queryParams = {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.latitude,
      longitude: this.longitude,
      radius: this.radius,
      sightTypes: this.sightTypes,
    };
  }

  buildQuerySightsPublicForCityTab() {
    this.queryParams = {
      page: this.paginationPublicSightsCityCurrentPage.value,
      userId: this.userID,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      locationId: this.locationId,
      sightTypes: this.sightTypes,
    };
  }

  // buildQuerySightsPublicForGeolocationTab(){
  //   this.queryParams =  {
  //     pagination: true,
  //     page: this.paginationPublicSightsGeolocationCurrentPage.value,
  //     userId: this.userID,
  //     favoriteUser: true,
  //     likedUser: true,
  //     statuses: [Statuses.publish].join(','),
  //     statusLast: true,
  //     locationId: this.locationId,
  //     latitude: this.latitude,
  //     longitude: this.longitude,
  //     radius: this.radius,
  //     //forEventPage: true,
  //     sightTypes: this.sightTypes,
  //   }
  // }
}
