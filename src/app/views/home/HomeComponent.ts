import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, NgZone } from '@angular/core';
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
import { types } from 'util';
import { YandexMetricService } from 'src/app/services/yandex-metric.service';
import { Metrika } from 'ng-yandex-metrika';
import { NavigationEnd, Router } from '@angular/router';
import { Location }  from '@angular/common';
import { filter } from 'rxjs/operators';
import { NgxSliderModule, Options   }from'@angular-slider/ngx-slider';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('buttonActive') buttonActive!: ElementRef;
  @ViewChild('calendula') calendula!: ElementRef

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
 

  //настройки ползунка радиуса
  options: Options = {
    floor: 1,
    ceil: 25,
    vertical: true,
    
    getPointerColor:(value:number)=>{
      return "#0085FF"
    }
  

  };


  CirclePoint!: ymaps.Circle;

  myGeo!: ymaps.Placemark;
  minZoom = 8;
  clusterer!: ymaps.Clusterer;
  radius: number = 1;
  date: any = {dateStart: new Date().toISOString(), dateEnd: new Date().toISOString()}
  headerHeight: any = document.getElementById('header')
  headerHeightM: any = document.getElementById('header-m')


  objectsInsideCircle!: any
  pixelCenter: any

  isFilterChanged: boolean = false

  eventsLoading: boolean = false
  sightsLoading: boolean = false
  stateType: string = "events"

  sightTypeId: any
  eventTypeId: any

  modalEventShowOpen: boolean = false
  modalContent: any[] = []
  activePlacemark?: any
  activeClaster?: any
  activeIcoLink: string = ''
  events: IEvent[] = []
  sights: ISight[] = []
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
    private ngZone: NgZone,
    private metrika: Metrika,
    private router: Router,
    private location: Location,
  )
  {
    let prevPath = this.location.path();
    this.router
    .events
      .pipe(filter(event => (event instanceof NavigationEnd)))
      .subscribe(() => {
        const newPath = location.path();
        this.metrika.hit(newPath, {
          referer: prevPath,
          callback: () => { console.log('hit end'); }
        });
        prevPath = newPath;
      });
  }

  // при клике по кнопке радиуча (5 10 15 20 25)
  setRadius(radius: number) {
    this.CirclePoint.geometry?.setRadius(1000 * radius)
    this.filterService.setRadiusTolocalStorage(radius.toString())
  }

  pinRadiusFormatter(value: number) {
    return `${value} км.`;
  }
  radiusChange(event:any){
    console.log(event.value)
    this.filterService.setRadiusTolocalStorage(event.value)
  }
  radiusPlus(){
    let radius: number = Number(this.filterService.getRadiusFromlocalStorage())
    if (radius+1 <= 25) {
      this.filterService.setRadiusTolocalStorage(`${radius+1}`)
    }

      
  }
  radiusMinus(){
    let radius: number = Number(this.filterService.getRadiusFromlocalStorage())
    if (radius-1 >= 1) {
      this.filterService.setRadiusTolocalStorage(`${radius-1}`)
    }
  }

  sightTypesChange(typeId: any){
    if (typeId !== 'all') {
    this.filterService.setSightTypesTolocalStorage([typeId])
    this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
    this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
    this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setSightTypesTolocalStorage([])
      this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    }
  }
  eventTypesChange(typeId: any){
    if (typeId !== 'all') {
      this.filterService.setEventTypesTolocalStorage([typeId])
      this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setEventTypesTolocalStorage([])
      this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    }
  }

  async onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map = { target, ymaps };

    // Создаем и добавляем круг
    this.CirclePoint = new ymaps.Circle([[11, 11], 1000 * this.radius], {}, { fillOpacity: 0.15, draggable: false });
    target.geoObjects.add(this.CirclePoint);

    // Определяем местоположение пользователя
    this.mapService.positionFilter(this.map, this.CirclePoint);

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
      this.getEventsAndSights();
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

      this.CirclePoint.geometry!.setCoordinates(coords);
      this.myGeo.geometry!.setCoordinates(coords);
      this.mapService.circleCenterLongitude.next(coords[1]);
      this.mapService.circleCenterLatitude.next(coords[0]);
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
    this.map.target.controls.remove("zoomControl")
    // this.map.target.controls.add('geolocationControl',{size:"large",position: {left:'50% ',bottom:0, right:0, top:"-150px",width:"150px"}})

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

              forkJoin([this.getPlacesIds(element.options._options.balloonContent.id, 'event')]).pipe(
                catchError((err) => {
                  return of(EMPTY);
                }),
                takeUntil(this.destroy$)
              ).subscribe()

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
            forkJoin([this.getPlacesIds(e.get('target').options._options.balloonContent.id, 'event')]).pipe(
              catchError((err) => {
                return of(EMPTY);
              }),
              takeUntil(this.destroy$)
            ).subscribe()
            this.activePlacemark = e.get('target');
            //this.activeIcoLink = this.host + ':' + this.port + e.get('target').options._options.balloonContent.types[0].ico;
            e.get('target').options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker active"><img src="${this.activeIcoLink}"/></div>`));
          } else {
            forkJoin([this.getSightsIds(e.get('target').options._options.balloonContent.id)]).pipe(
              catchError((err) => {
                return of(EMPTY);
              }),
              takeUntil(this.destroy$)
            ).subscribe(() => {
            });
            this.activePlacemark = e.get('target');


            e.get('target').options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker active"><img src="${this.activeIcoLink}"/></div>`));
          }
        }

        this.navigationService.modalEventShowOpen.next(true);

      }
  });
  }

  getPlacesIds(id: number, type: string): Observable<any> {

    return new Observable((observer) => {
      this.placeService.getPlaceById(id).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        if (type=='event'){
          this.ngZone.run(()=> {
            response.places.event.type = 'events'
            this.modalContent.push(response.places.event)
          })
        }
        this.cdr.detectChanges();
        observer.next(EMPTY);
        observer.complete();
      })
    })
  }

  getSightsIds(id: number): Observable<any>{
    return new Observable((observer) => {
      this.sightsService.getSightById(id).pipe(takeUntil(this.destroy$)).subscribe((response: any)=> {
        this.ngZone.run(()=> {
          response.type = 'sights'
          this.modalContent.push(response)
        })
      })
    })
  }

  getPlaces(): Observable<any> {
    return new Observable((observer) => {
    this.eventsLoading = true;
    this.placeService.getPlaces(this.queryBuilderService.queryBuilder('placesForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.places = response.places
      // console.log(this.filterService.locationLatitude.value, this.filterService.locationLongitude.value)
      let events: any[] = []
      if (response.places.length) {



      }
      this.cdr.detectChanges();
      observer.next(EMPTY);
      observer.complete();
    });
    });
  }

  getSights(): Observable<any> {
    return new Observable((observer) => {
      this.sightsLoading = true;
      this.sightsService.getSightsForMap(this.queryBuilderService.queryBuilder('sightsForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.sights = response.sights;
        this.filterService.setSightsCount(response.sights.length)
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
    if (!this.places.length && !this.sights.length && this.radius < 25 && this.navigationService.appFirstLoading.value) {
      this.filterService.setRadiusTolocalStorage((++this.radius).toString());
      this.CirclePoint.geometry?.setRadius(this.radius * 1000);
      this.getEventsAndSights();
    } else {
      this.navigationService.appFirstLoading.next(false);
      this.eventsLoading = false;
      this.sightsLoading = false;
    }

    //this.setPlacemarks(this.events, 'events');


    if(this.stateType=="events"){
      this.setPlacemarks(this.places, 'event');
    }
    else if(this.stateType=='sights'){

      this.setPlacemarks(this.sights, 'sights');
    }
    else if(this.stateType=="all"){
      this.setPlacemarks(this.places, 'event');
      this.setPlacemarks(this.sights, 'sights');
    }


    this.setPlacemarksAndClusters();
    this.setBoundsCoordsToMapService();
    this.cdr.detectChanges();
  }



  setPlacemarks(collection: any, type: string) {

    collection.map((item: any) => {

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
          // С иконкой
          // iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #7df088;" class="marker"><img src="${icoLink}"/></div>`)
          iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #7df088;" class="marker"></div>`)
        });
        this.placemarks.push(placemark);
      } else {
        placemark = new ymaps.Placemark(
          [item.latitude, item.longitude],
          {}, {
            balloonContent: item,
            balloonAutoPan: false,
            // С иконкой
            // iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #6574fc;" class="marker"><img src="${icoLink}"/></div>`)
            iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #6574fc;" class="marker" ></div>`)
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
    // if (this.queryBuilderService.latitude && this.queryBuilderService.longitude) {
      const sources: any[] = []
      if (this.stateType=="events"){
        sources.push(this.getPlaces())
      }
      else if(this.stateType=="sights"){
        sources.push(this.getSights())
      }



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
    // } else {
    //   this.getEventsAndSights()
    // }
  }

  modalClose() {
    this.navigationService.modalEventShowOpen.next(false);
  }

  onSegmentChanged(event: any, p: number){
    if(p==1)
    {
      this.buttonActive.nativeElement.style.transform = "translateY(0px)"
      this.calendula.nativeElement.style.top = this.headerHeight.offsetHeight + "px"
    }
    else if(p==2)
    {
      this.buttonActive.nativeElement.style.transform = "translateY(46px)";
      this.calendula.nativeElement.style.top = "-100px"
    }
    else if(p==3)
    {
      this.buttonActive.nativeElement.style.transform = "translateY(92px)"
    }

  }
  changeDateRange(event: any){
    this.date.dateStart = event.dateStart
    this.date.dateEnd = event.dateEnd

  }
  setDate(event: any) {
    this.filterService.setStartDateTolocalStorage(event.dateStart.toString())
    this.filterService.setEndDateTolocalStorage(event.dateEnd.toString())
    this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
    this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
    // this.queryBuilderService.updateParams()
    this.filterService.changeFilter.next(true)
  }

  getGeoPosition(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude

        ];
        this.map.target.setCenter(coordinates)

      }, (error) => {
        this.toastService.showToast("Убедитесь что доступ к геолокации предоставлен",'warning');

      });
    }


  }



  ngOnInit(): void {
    //Подписываемся на изменение радиуса
    this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value);
      if (this.map && this.map.target)
        this.map.target.setBounds((this.CirclePoint.geometry?.getBounds())!, { checkZoomRange: true });
    });

    //Подписываемся на состояние модалки показа ивентов и мест
    this.navigationService.modalEventShowOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
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

    this.filterService.locationLongitude.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.mapService.circleCenterLongitude.next(value);
    });

    this.filterService.locationLatitude.pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.mapService.circleCenterLatitude.next(value);
    });
    this.filterService.sightTypes.pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.sightTypeId = value[0]
    });
    this.filterService.eventTypes.pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.eventTypeId = value[0]
    });



  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
