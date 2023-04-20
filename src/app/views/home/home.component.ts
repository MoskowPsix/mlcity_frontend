import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { YaReadyEvent } from 'angular8-yandex-maps'
import {catchError, delay, EMPTY, map, of, Subject, takeUntil, tap, skip, forkJoin, Observable, debounceTime} from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { EventsService } from 'src/app/services/events.service'
import { ToastService } from 'src/app/services/toast.service'
import { MapService } from '../../services/map.service'
import { environment } from '../../../environments/environment'
import { IEvent } from 'src/app/models/event'
import { NavigationService } from 'src/app/services/navigation.service'
import { FilterService } from 'src/app/services/filter.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { ISight } from 'src/app/models/sight'
import { SightsService } from 'src/app/services/sights.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  map!:YaReadyEvent<ymaps.Map>
  placemarks: ymaps.Placemark[]=[]
  CirclePoint!: ymaps.Circle

  myGeo!:ymaps.Placemark
  minZoom = 8
  clusterer!: ymaps.Clusterer
  radius: number = 1

  objectsInsideCircle!: any
  pixelCenter: any

  isFilterChanged: boolean = false
  
  eventsLoading: boolean = false
  sightsLoading: boolean = false

  modalEventShowOpen: boolean = false
  //event!: IEvent // возможно удалить
  modalContent?: any
  activePlacemark?: any 
  activeIcoLink: string = ''
  events: IEvent[] =[]
  sights: ISight[] = []

  constructor(
    private mapService: MapService, 
    private eventsService: EventsService, 
    private sightsService: SightsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService
  ) {}
  
  // при клике по кнопке радиуча (5 10 15 20 25)
  setRadius(radius: number){  
    this.CirclePoint.geometry?.setRadius(1000*radius)
    this.filterService.setRadiusTolocalStorage(radius.toString())
  }

  async onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map = {target, ymaps}

    // Создаем и добавляем круг
    this.CirclePoint = new ymaps.Circle([[11,11],1000*this.radius],{},{fillOpacity:0.15, draggable:false})
    target.geoObjects.add(this.CirclePoint)

    // Определяем местоположение пользователя
    this.mapService.positionFilter(this.map, this.CirclePoint)
    
    //Создаем метку в центре круга, для перетаскивания
    this.myGeo = new ymaps.Placemark([11,11],{}, {
      iconLayout: 'default#image',
      iconImageHref:'/assets/my_geo.svg',
      iconImageSize: [60, 60],
      iconImageOffset: [-30, -55]
    })

    target.geoObjects.add(this.myGeo)
    
    if (this.navigationService.appFirstLoading.value) {
      this.eventsLoading = true
      this.cdr.detectChanges()
      //this.getEvents()
      this.getEventsAndSights()
    }

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin',  (e) => {
      if (this.objectsInsideCircle){
        this.map.target.geoObjects.remove(this.objectsInsideCircle)

        this.objectsInsideCircle.remove(this.placemarks)
      this.placemarks=[]
      }

      if (!this.navigationService.appFirstLoading.value) {
        this.eventsLoading = true
        this.CirclePoint.geometry?.setRadius(this.radius*15)
        this.CirclePoint.options.set('fillOpacity', 0.7)
        this.CirclePoint.options.set('fillColor', '#474A51')
        this.CirclePoint.options.set('strokeWidth', 0)
        this.myGeo.options.set('iconImageOffset', [-30, -62])
      }
      this.cdr.detectChanges()
    })

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick',  (e) => {
      const { globalPixelCenter, zoom } = e.get('tick')
      const projection = this.map.target.options.get('projection')
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom)

      this.CirclePoint.geometry?.setCoordinates(coords)
      this.myGeo.geometry?.setCoordinates(coords)

    })

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend',  async (e) => {
      if (!this.navigationService.appFirstLoading.value) {
        this.CirclePoint.geometry?.setRadius(this.radius*1000)
        this.myGeo.options.set('iconImageOffset', [-30, -55])
        this.CirclePoint.options.set('fillColor', )
        this.CirclePoint.options.set('fillOpacity', 0.15)
        this.CirclePoint.options.set('strokeWidth', )    
        this.getEventsAndSights()
      }
    })
  }
  
  setBoundsCoordsToMapService(){
    this.mapService.radiusBoundsLats.next(this.CirclePoint.geometry?.getBounds()![0][0] + ',' + this.CirclePoint.geometry?.getBounds()![1][0])
    this.mapService.radiusBoundsLongs.next(this.CirclePoint.geometry?.getBounds()![0][1] + ',' + this.CirclePoint.geometry?.getBounds()![1][1])
  }

  visiblePlacemarks(){
    //При изменении радиуса проверяем метки для показа/скрытия
    this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).clusterize()//.addToMap(this.map.target)//.clusterize()
    this.map.target.geoObjects.add(this.objectsInsideCircle)
    this.cdr.detectChanges()
  }

  getEvents(): Observable<any>{
    return new Observable((observer) => {
      this.eventsLoading = true
      this.setBoundsCoordsToMapService() // я хз почему, но эта штука только тут работает
      this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.events = response.events
        this.eventsLoading = false
        this.cdr.detectChanges()
        observer.next(EMPTY)
        observer.complete()
      })
    })  
  }

  getSights(): Observable<any>{
    return new Observable((observer) => {
      this.sightsLoading = true
      this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsForMap')).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.sights = response.sights
        this.sightsLoading = false
        this.cdr.detectChanges()
        observer.next(EMPTY)
        observer.complete()
      })
    }) 
  }

  setMapData(){
    if (this.objectsInsideCircle){
      this.map.target.geoObjects.remove(this.objectsInsideCircle)
      this.objectsInsideCircle.remove(this.placemarks)
      this.placemarks=[]
    }
    //добавить в if - && this.navigationService.appFirstLoading.value - если не требуется увеличивать радиус после первого запуска
    if (!this.events.length && !this.sights.length && this.radius < 25 ) {
      this.filterService.setRadiusTolocalStorage((++this.radius).toString())
      this.CirclePoint.geometry?.setRadius(this.radius * 1000)
      this.getEventsAndSights()
    } else {
      this.navigationService.appFirstLoading.next(false)
      this.eventsLoading = false
    }

    this.setPlacemarks(this.events)
    this.setPlacemarks(this.sights)

    this.visiblePlacemarks()
    this.setBoundsCoordsToMapService()
    this.cdr.detectChanges()
  }

  setPlacemarks(collection: any){
    collection.map((item: any) => {
      let icoLink = item && item.types && item.types.length ? this.host + ':' + this.port + item.types[0].ico : ''
      let placemark = new ymaps.Placemark([item.latitude, item.longitude],{
      }, {   
          balloonAutoPan:false, 
          iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div class="marker"><img src="${icoLink}"/></div>`)
        })

        //Клик по метке и загрузка ивента в модалку
        placemark.events.add('click', () => { 
          placemark.options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker active"><img src="${icoLink}"/></div>`))
          this.modalContent = item// <------------ тут надо что-то придумать чтобы и ивенты и места показывались, не путались ид. а также с кластаризацией
          this.navigationService.modalEventShowOpen.next(true)
          this.activePlacemark = placemark
          this.activeIcoLink = icoLink
        })

      this.placemarks.push(placemark)
    })
  }

  getEventsAndSights(){
    const sources = [this.getEvents(),this.getSights()]
    forkJoin(sources).pipe(
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.navigationService.appFirstLoading.next(false)
        this.eventsLoading = false
        this.sightsLoading = false
        this.cdr.detectChanges()
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.setMapData()
    })
  }

  modalClose(){
    this.navigationService.modalEventShowOpen.next(false)
  }

  ngOnInit(): void {
    //Подписываемся на изменение радиуса
    this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value)
      if(this.map && this.map.target)
        this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true})
    })

    //Подписываемся на состояние модалки показа ивентов и мест
    this.navigationService.modalEventShowOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalEventShowOpen = value
      if (!value && this.activePlacemark){ // убираем активный класс у кастомного маркера при закрытие модалки
        this.activePlacemark.options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass(`<div class="marker"><img src="${this.activeIcoLink}"/></div>`)) 
      }
      this.cdr.detectChanges()
    })
    
     //Подписываемся на изменение фильтра и если было изменение города, то перекинуть на выбранынй город. 
     //Пропускаем 1 skip(1) потому что, при запуске очищаются фильтры и прилетает true
    this.filterService.changeFilter.pipe(skip(1),debounceTime(1000),takeUntil(this.destroy$)).subscribe(value => {
      if (value === true){
        this.mapService.positionFilter(this.map, this.CirclePoint)
      }
    })
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
  
}
