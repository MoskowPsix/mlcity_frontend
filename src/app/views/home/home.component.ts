import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { YaReadyEvent } from 'angular8-yandex-maps'
import {catchError, delay, EMPTY, map, of, Subject, takeUntil, tap, skip} from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { EventsService } from 'src/app/services/events.service'
import { ToastService } from 'src/app/services/toast.service'
import { MapService } from '../../services/map.service'
import { environment } from '../../../environments/environment'
import { IEvent } from 'src/app/models/events'
import { NavigationService } from 'src/app/services/navigation.service'
import { FilterService } from 'src/app/services/filter.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'

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

  modalEventShowOpen: boolean = false
  event!: IEvent

  constructor(
    private mapService:MapService, 
    private eventsService:EventsService, 
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
      this.getEvents()
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
        this.getEvents()
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

  getEvents() {
    // Устанавливаем границы радиуса - юзать именно тут иначего приходятпрошлые координаты
    this.setBoundsCoordsToMapService()
    this.eventsService.getEvents(this.queryBuilderService.buidEventsQuery()).pipe(
      delay(100),
      map((response:any) => response.events),
      tap(() => this.eventsLoading = true),
      tap(() => {
        if (this.objectsInsideCircle){
          this.map.target.geoObjects.remove(this.objectsInsideCircle)
          this.objectsInsideCircle.remove(this.placemarks)
          this.placemarks=[]
        }
      }),
      tap((events: IEvent[]) => {
        if ((!events.length && this.radius < 25 && this.navigationService.appFirstLoading.value)) {
          this.filterService.setRadiusTolocalStorage((++this.radius).toString())
          this.CirclePoint.geometry?.setRadius(this.radius * 1000)
          this.getEvents()
        } else {
          this.navigationService.appFirstLoading.next(false)
          this.eventsLoading = false
        }
      }),
      map((events: IEvent[]) => { 
        events.map(event => {
          let icoLink = event && event.types && event.types.length ? this.host + ':' + this.port + event.types[0].ico : ''
          let placemark = new ymaps.Placemark([event.latitude, event.longitude],{
          }, {   
              balloonAutoPan:false, 
              iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div class="marker"><img src="${icoLink}"/></div>`)
            })

            //Клик по метке и загрузка ивента в модалку
            placemark.events.add('click', () => { 
              this.event = event
              this.navigationService.modalEventShowOpen.next(true)
            })

          this.placemarks.push(placemark)
        })
      }),
      tap(() => {
        this.visiblePlacemarks()
        this.setBoundsCoordsToMapService()
      }),
      tap(() => {this.cdr.detectChanges()}),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.navigationService.appFirstLoading.next(false)
        this.eventsLoading = false
        this.cdr.detectChanges()
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
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
      this.cdr.detectChanges()
    })
    
     //Подписываемся на изменение фильтра и если было изменение города, то перекинуть на выбранынй город. 
     //Пропускаем 1 skip(1) потому что, при запуске очищаются фильтры и прилетает true
    this.filterService.changeFilter.pipe(skip(1),takeUntil(this.destroy$)).subscribe(value => {
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
