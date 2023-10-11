import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { YaReadyEvent } from 'angular8-yandex-maps';
import { catchError, EMPTY, of, Subject, takeUntil, forkJoin, Observable, debounceTime, debounce, timer } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { MapService } from '../../services/map.service';
import { environment } from '../../../environments/environment';
import { IEvent } from 'src/app/models/event';
import { NavigationService } from 'src/app/services/navigation.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { ISight } from 'src/app/models/sight';
import { SightsService } from 'src/app/services/sights.service';
import { PlaceService } from 'src/app/services/place.service';
import { IPlace } from 'src/app/models/place';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  host: string = environment.BACKEND_URL;
  port: string = environment.BACKEND_PORT;

  map!: YaReadyEvent<ymaps.Map>;
  placemarks: ymaps.Placemark[] = [];
  placemarks_sights: ymaps.Placemark[] = [];
  placemarks_now: ymaps.Placemark[] = [];
  placemarks_today: ymaps.Placemark[] = [];
  placemarks_tomorrow: ymaps.Placemark[] = [];
  placemarks_week: ymaps.Placemark[] = [];
  placemarks_month: ymaps.Placemark[] = [];


  CirclePoint!: ymaps.Circle;

  myGeo!: ymaps.Placemark;
  minZoom = 8;
  clusterer!: ymaps.Clusterer;
  radius: number = 1;

  objectsInsideCircle!: any;
  pixelCenter: any;

  isFilterChanged: boolean = false;

  eventsLoading: boolean = false;
  sightsLoading: boolean = false;

  modalEventShowOpen: boolean = false;
  modalContent: any[] = [];
  activePlacemark?: any;
  activeClaster?: any;
  activeIcoLink: string = '';
  events: IEvent[] = [];
  sights: ISight[] = [];
  places: IPlace[] = []

  constructor(
    private mapService: MapService,
    private eventsService: EventsService,
    private sightsService: SightsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private placeService: PlaceService,
  ) { }

  // при клике по кнопке радиуча (5 10 15 20 25)
  setRadius(radius: number) {
    this.CirclePoint.geometry?.setRadius(1000 * radius);
    this.filterService.setRadiusTolocalStorage(radius.toString());
  }

  async onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map = { target, ymaps };

    // Создаем и добавляем круг
    this.CirclePoint = new ymaps.Circle([[11, 11], 1000 * this.radius], {}, { fillOpacity: 0.15, draggable: false });
    await target.geoObjects.add(this.CirclePoint);

    // Определяем местоположение пользователя
    await this.mapService.positionFilter(this.map, this.CirclePoint);

    //Создаем метку в центре круга, для перетаскивания
    this.myGeo = new ymaps.Placemark([11, 11], {}, {
      iconLayout: 'default#image',
      iconImageHref: '/assets/my_geo.svg',
      iconImageSize: [60, 60],
      iconImageOffset: [-30, -55]
    });

    target.geoObjects.add(this.myGeo);

    if (this.navigationService.appFirstLoading.value) {
      this.eventsLoading = true;
      this.sightsLoading = true;
      this.cdr.detectChanges();
      //this.getEvents()
      await this.getEventsAndSights();
    }

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin', (e) => {
      if (this.objectsInsideCircle) {
        this.map.target.geoObjects.remove(this.objectsInsideCircle);

        this.objectsInsideCircle.remove(this.placemarks);
        this.placemarks = [];
      }

      if (!this.navigationService.appFirstLoading.value) {
        this.eventsLoading = true;
        this.sightsLoading = true;
        this.CirclePoint.geometry?.setRadius(this.radius * 15);
        this.CirclePoint.options.set('fillOpacity', 0.7);
        this.CirclePoint.options.set('fillColor', '#474A51');
        this.CirclePoint.options.set('strokeWidth', 0);
        this.myGeo.options.set('iconImageOffset', [-30, -62]);
      }
      this.cdr.detectChanges();
    });

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick', (e) => {
      const { globalPixelCenter, zoom } = e.get('tick');
      const projection = this.map.target.options.get('projection');
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom);

      this.CirclePoint.geometry?.setCoordinates(coords);
      this.myGeo.geometry?.setCoordinates(coords);

    });

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend', async (e) => {
      if (!this.navigationService.appFirstLoading.value) {
        this.CirclePoint.geometry?.setRadius(this.radius * 1000);
        this.myGeo.options.set('iconImageOffset', [-30, -55]);
        this.CirclePoint.options.set('fillColor');
        this.CirclePoint.options.set('fillOpacity', 0.15);
        this.CirclePoint.options.set('strokeWidth');
        this.getEventsAndSights();
      }
    });
    // if (!this.map) {
    //   this.onMapReady({target, ymaps});
    // }
  }

  setBoundsCoordsToMapService() {
    this.mapService.circleCenterLatitude.next((this.CirclePoint.geometry?.getCoordinates()![0])!);
    this.mapService.circleCenterLongitude.next((this.CirclePoint.geometry?.getCoordinates()![1])!);
  }

  async setPlacemarksAndClusters() {
    //При изменении радиуса проверяем метки для показа/скрытия
    this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).clusterize({ hasBalloon: false, clusterBalloonPanelMaxMapArea: 0, clusterOpenBalloonOnClick: true });
    this.map.target.geoObjects.add(this.objectsInsideCircle);


    this.objectsInsideCircle.events.add('click', (e: any) => {
      this.modalContent = [];

      if (!e.get('target')._clusterBounds) {

        if (e.get('target').properties.get('geoObjects') !== undefined) {
          e.get('target').properties.get('geoObjects').forEach((element: any) => {
            if (element.options._options.balloonContent.type === 'event') {
            this.modalContent.push(element.options._options.balloonContent.event);
            this.activeClaster = e.get('target');
            e.get('target').options.set('preset', 'islands#invertedPinkClusterIcons');
            } else {
              this.modalContent.push(element.options._options.balloonContent);
              this.activeClaster = e.get('target');
              e.get('target').options.set('preset', 'islands#invertedPinkClusterIcons');
            }
          });
        } else {
          if (e.get('target').options._options.balloonContent.type === 'event') {
            this.modalContent.push(e.get('target').options._options.balloonContent.event);
            //console.log()
            // this.eventsService.getEventById(e.get('target').options._options.balloonContent.event.id).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
            //   this.modalContent.push(response)
            //   console.log(this.modalContent)
            // });
            this.activePlacemark = e.get('target');
            //this.activeIcoLink = this.host + ':' + this.port + e.get('target').options._options.balloonContent.types[0].ico;
            e.get('target').options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker active"><img src="${this.activeIcoLink}"/></div>`));
          } else {
            this.modalContent.push(e.get('target').options._options.balloonContent);
            this.activePlacemark = e.get('target');
            this.activeIcoLink = this.host + ':' + this.port + e.get('target').options._options.balloonContent.types[0].ico;
            e.get('target').options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker active"><img src="${this.activeIcoLink}"/></div>`));
          }
        }
        this.navigationService.modalEventShowOpen.next(true);
      }
  });
  }

  // getEvents(): Observable<any> {
  //   return new Observable((observer) => {
  //     this.eventsLoading = true;
  //     this.setBoundsCoordsToMapService(); // я хз почему, но эта штука только тут работает
  //     this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
  //       this.events = response.events;
  //       //this.eventsLoading = false
  //       this.cdr.detectChanges();
  //       observer.next(EMPTY);
  //       observer.complete();
  //     });
  //   });
  // }

  getPlaces(): Observable<any> {
    return new Observable((observer) => {
    this.eventsLoading = true;
    this.placeService.getPlaces(this.queryBuilderService.queryBuilder('placesForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.places = response.places
      this.cdr.detectChanges();
      observer.next(EMPTY);
      observer.complete();
    });
    });
  }

  getSights(): Observable<any> {
    return new Observable((observer) => {
      this.sightsLoading = true;
      this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.sights = response.sights;
        //this.sightsLoading = false
        this.cdr.detectChanges();
        observer.next(EMPTY);
        observer.complete();
      });
    });
  }

  setMapData() {
    if (this.objectsInsideCircle) {
      this.map.target.geoObjects.remove(this.objectsInsideCircle);
      this.objectsInsideCircle.remove(this.placemarks);
      this.placemarks = [];
    }
    //добавить в if - && this.navigationService.appFirstLoading.value - если не требуется увеличивать радиус после первого запуска
    if (!this.events.length && !this.sights.length && this.radius < 25 && this.navigationService.appFirstLoading.value) {
      this.filterService.setRadiusTolocalStorage((++this.radius).toString());
      this.CirclePoint.geometry?.setRadius(this.radius * 1000);
      this.getEventsAndSights();
    } else {
      this.navigationService.appFirstLoading.next(false);
      this.eventsLoading = false;
      this.sightsLoading = false;
    }

    //this.setPlacemarks(this.events, 'events');
    this.setPlacemarks(this.sights, 'sights');
    this.setPlacemarks(this.places, 'event');

    this.setPlacemarksAndClusters();
    this.setBoundsCoordsToMapService();
    this.cdr.detectChanges();
  }

  setPlacemarks(collection: any, type: string) {
    collection.map((item: any) => {
      //console.log(item)
      let time_event = Math.ceil(new Date(item.date_start).getTime() / 1000)
      let time_now = Math.ceil(new Date().getTime() / 1000);
      let time_deff = time_event - time_now

      item["type"] = type;
      //let icoLink = item && item.types && item.types.length ? this.host + ':' + this.port + item.types[0].ico : '';
       let icoLink = 0;
      let placemark
      if(item.type === 'event'){
        placemark = new ymaps.Placemark(
        [item.latitude, item.longitude],
        {}, {
          balloonContent: item,
          balloonAutoPan: false,
          iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #7df088;" class="marker"><img src="${icoLink}"/></div>`)
        });
        this.placemarks.push(placemark);
      } else {
        placemark = new ymaps.Placemark(
          [item.latitude, item.longitude],
          {}, {
            balloonContent: item,
            balloonAutoPan: false,
            iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #6574fc;" class="marker"><img src="${icoLink}"/></div>`)
          });
          this.placemarks.push(placemark);
      }
      // if ( 0 > time_deff ) { // Сейчас
      //   placemark = new ymaps.Placemark(
      //   [item.latitude, item.longitude],
      //   {}, {
      //     balloonContent: item,
      //     //balloonAutoPan: false,
      //     iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style=" border-color: rgba(129, 235, 164, 1);" class="marker now"><img src="${icoLink}"/></div>`)
      //   });
      //   this.placemarks.push(placemark);
      // } else if (86400 > time_deff && time_deff > 0) { // Сегодня
      //     placemark = new ymaps.Placemark(
      //     [item.latitude, item.longitude],
      //     {}, {
      //       balloonContent: item,
      //       balloonAutoPan: false,
      //       iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: 0040ff;" class="marker"><img src="${icoLink}"/></div>`)
      //     });
      //     this.placemarks.push(placemark);    
      // } else if (604800 > time_deff && time_deff > 86400) { // Через неделю
      //   placemark = new ymaps.Placemark(
      //   [item.latitude, item.longitude],
      //   {}, {
      //     balloonContent: item,
      //     balloonAutoPan: false,
      //     iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #3366ff;" class="marker"><img src="${icoLink}"/></div>`)
      //   });
      //   this.placemarks.push(placemark);
      // } else if (2629743 > time_deff && time_deff > 604800) { // Через месяц
      //   placemark = new ymaps.Placemark(
      //   [item.latitude, item.longitude],
      //   {}, {
      //     balloonContent: item,
      //     balloonAutoPan: false,
      //     iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #668cff;" class="marker"><img src="${icoLink}"/></div>`)
      //   });
      //   this.placemarks.push(placemark);
      // } else if (31556926 > time_deff && time_deff > 2629743) { // Через год
      //   placemark = new ymaps.Placemark(
      //   [item.latitude, item.longitude],
      //   {}, {
      //     balloonContent: item,
      //     balloonAutoPan: false,
      //     iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #ffffff;" class="marker"><img src="${icoLink}"/></div>`)
      //   });
      //   this.placemarks.push(placemark);
      // } else if (!item.date_start && !item.date_end) { // Достопримечательности
      //   placemark = new ymaps.Placemark(
      //     [item.latitude, item.longitude],
      //     {}, {
      //       balloonContent: item,
      //       balloonAutoPan: false,
      //       iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #993333;" class="marker"><img src="${icoLink}"/></div>`)
      //     });
      //     this.placemarks.push(placemark);
      // }
      //console.log(item.date_start)

        //Клик по метке и загрузка ивента в модалку
        // placemark.events.add('click', () => { 
        //   placemark.options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker active"><img src="${icoLink}"/></div>`))
        //   this.modalContent = item// <------------ тут надо что-то придумать чтобы и ивенты и места показывались, не путались ид. а также с кластаризацией
        //   this.navigationService.modalEventShowOpen.next(true)
        //   this.activePlacemark = placemark
        //   this.activeIcoLink = icoLink
        // })
        //this.placemarks.push(placemark);
      //let now = this.formatDate(new Date())
    });
  }

  // padTo2Digits(num: number) {
  //   return num.toString().padStart(2, '0');
  // }

  // formatDate(date: Date) {
  //   return (
  //     [
  //       date.getFullYear(),
  //       this.padTo2Digits(date.getMonth() + 1),
  //       this.padTo2Digits(date.getDate()),
  //     ].join('-') +
  //     ' ' +
  //     [
  //       this.padTo2Digits(date.getHours()),
  //       this.padTo2Digits(date.getMinutes()),
  //       this.padTo2Digits(date.getSeconds()),
  //     ].join(':')
  //   );
  // }
  getEventsAndSights() {
    const sources = [this.getPlaces(), this.getSights()];
    forkJoin(sources).pipe(
      catchError((err) => {
        this.toastService.showToast(MessagesErrors.default, 'danger');
        this.navigationService.appFirstLoading.next(false);
        this.eventsLoading = false;
        this.sightsLoading = false;
        this.cdr.detectChanges();
        return of(EMPTY);
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.setMapData();
    });
  }

  modalClose() {
    this.navigationService.modalEventShowOpen.next(false);
  }

  ngOnInit(): void {
    //Подписываемся на изменение радиуса
    this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value);
      if (this.map && this.map.target)
        this.map.target.setBounds((this.CirclePoint.geometry?.getBounds())!, { checkZoomRange: true });
    });

    //Подписываемся на состояние модалки показа ивентов и мест
    this.navigationService.modalEventShowOpen.pipe(debounce(() => timer(1000)),takeUntil(this.destroy$)).subscribe(value => {
      this.modalEventShowOpen = value;
      if (!value && this.activePlacemark) { // убираем активный класс у кастомного маркера при закрытие модалки
        this.activePlacemark.options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker"><img src="${this.activeIcoLink}"/></div>`));
        this.setMapData();
      }
      if (!value && this.activeClaster) { // убираем активный класс у кластера при закрытие модалки
        this.activeClaster.options.set('preset', '');
        this.setMapData();
      }
      this.cdr.detectChanges();
    });

    //Подписываемся на изменение фильтра и если было изменение города, то перекинуть на выбранный город. 
    this.filterService.changeFilter.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value === true) {
        this.mapService.positionFilter(this.map, this.CirclePoint);
        this.map.target.setBounds((this.CirclePoint.geometry?.getBounds())!, { checkZoomRange: true });
        this.getEventsAndSights();
      }
    });
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
