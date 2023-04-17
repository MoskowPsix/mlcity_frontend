import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { YaReadyEvent } from 'angular8-yandex-maps'
import {catchError, delay, EMPTY, map, of, Subject, takeUntil, tap} from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { Statuses } from 'src/app/enums/statuses'
import { IGetEventsAndSights } from 'src/app/models/getEventsAndSights'
import { EventsService } from 'src/app/services/events.service'
import { ToastService } from 'src/app/services/toast.service'
import { MapService } from '../../services/map.service'
import { environment } from '../../../environments/environment'
import { IEvent } from 'src/app/models/events'
import { NavigationService } from 'src/app/services/navigation.service'
import { FilterService } from 'src/app/services/filter.service'

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

  queryParams?: IGetEventsAndSights 
  cityCoords!: number[]

  firstStart: boolean = true
  isFilterChanged: boolean = false
  
  eventsLoading: boolean = false

  modalEventShowOpen: boolean = false
  event!: IEvent

  constructor(
    private mapService:MapService, 
    private eventsService:EventsService, 
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private navigationServise: NavigationService,
    private filterService: FilterService
    ) {}
  
  setRadius(radius: number){ 
    
    if (radius === 1){
      this.CirclePoint.geometry?.setRadius(1000)
    } else {
      this.CirclePoint.geometry?.setRadius(1000*radius)
    } 
    this.filterService.setRadiusTolocalStorage(radius.toString())
  }

  async onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map={target, ymaps}

    // Создаем и добавляем круг
    this.CirclePoint=new ymaps.Circle([[11,11],1000*this.radius],{},{fillOpacity:0.15, draggable:false})
    target.geoObjects.add(this.CirclePoint)

    // Определяем местоположение пользователя
    this.mapService.positionFilter(this.map, this.CirclePoint)
    
    //Создаем метку в центре круга, для перетаскивания
    this.myGeo=new ymaps.Placemark([11,11],{}, {
      iconLayout: 'default#image',
      iconImageHref:'/assets/my_geo.svg',
      iconImageSize: [60, 60],
      iconImageOffset: [-30, -55]
    })

    target.geoObjects.add(this.myGeo)
    
    if (this.firstStart) {
      this.eventsLoading = true
      this.cdr.detectChanges()
      this.getEvents()
    }

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin',  (e) => {
      console.log('actionbegin')

      // this.cdr.detectChanges()
      if (this.objectsInsideCircle){
        this.map.target.geoObjects.remove(this.objectsInsideCircle)

        this.objectsInsideCircle.remove(this.placemarks)
      this.placemarks=[]
      }

      if (!this.firstStart) {
        this.eventsLoading = true
        // this.cdr.detectChanges()
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
      console.log('actiontick')
      const { globalPixelCenter, zoom } = e.get('tick')
      const projection = this.map.target.options.get('projection')
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom)

      this.CirclePoint.geometry?.setCoordinates(coords)
      this.myGeo.geometry?.setCoordinates(coords)

    })

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend',  async (e) => {
      console.log('actionend')
      if (!this.firstStart) {
        this.CirclePoint.geometry?.setRadius(this.radius*1000)
        this.myGeo.options.set('iconImageOffset', [-30, -55])
        this.CirclePoint.options.set('fillColor', )
        this.CirclePoint.options.set('fillOpacity', 0.15)
        this.CirclePoint.options.set('strokeWidth', )       
        this.getEvents()
      }
    })
  }

  visiblePlacemarks(){
    //При изменении радиуса проверяем метки для показа/скрытия
    this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).clusterize()//.addToMap(this.map.target)//.clusterize()
    this.map.target.geoObjects.add(this.objectsInsideCircle)
    this.cdr.detectChanges()
  }

  getEvents() {
    this.queryParams =  {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.CirclePoint.geometry?.getBounds()![0][0] + ',' + this.CirclePoint.geometry?.getBounds()![1][0],
      longitude: this.CirclePoint.geometry?.getBounds()![0][1] + ',' + this.CirclePoint.geometry?.getBounds()![1][1],
    }
    this.eventsService.getEvents(this.queryParams).pipe(
      delay(100),
      map((response:any) => {
        console.log(response.events)
        return response.events; 
        
      }),
      tap(() => {
        this.eventsLoading = true
          //this.cdr.detectChanges()
      }),
      tap(() => {
        if (this.objectsInsideCircle){
          this.map.target.geoObjects.remove(this.objectsInsideCircle)
          this.objectsInsideCircle.remove(this.placemarks)
          this.placemarks=[]
        }
      }),
      tap((events: IEvent[]) => {
        if ((!events.length && this.radius < 25 && this.firstStart)) {
          this.filterService.setRadiusTolocalStorage((++this.radius).toString())
          this.CirclePoint.geometry?.setRadius(this.radius * 1000)
          this.getEvents()
        } else {
          this.firstStart = false
          this.eventsLoading = false
         // this.cdr.detectChanges()
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
              this.navigationServise.modalEventShowOpen.next(true)
             // this.cdr.detectChanges()
            })

          this.placemarks.push(placemark)
        })
      }),
      tap(() => {
        this.visiblePlacemarks()
        this.mapService.radiusBoundsLats.next(this.CirclePoint.geometry?.getBounds()![0][0] + ',' + this.CirclePoint.geometry?.getBounds()![1][0])
        this.mapService.radiusBoundsLongs.next(this.CirclePoint.geometry?.getBounds()![0][1] + ',' + this.CirclePoint.geometry?.getBounds()![1][1])
      }),
      tap(() => {this.cdr.detectChanges()}),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.firstStart = false
        this.eventsLoading = false
        this.cdr.detectChanges()
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  modalClose(){
    this.navigationServise.modalEventShowOpen.next(false)
  }

  ngOnInit(): void {
    //Подписываемся на изменение радиуса
    this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value)
      if(this.map && this.map.target)
        this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true})
    })

    //Подписываемся на состояние модалки показа ивентов и мест
    this.navigationServise.modalEventShowOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalEventShowOpen = value
      this.cdr.detectChanges()
    })
    
     //Подписываемся на изменение фильтра и если было изменение горда, то перекинуть на выбранынй город
     this.filterService.changeCityFilter.pipe(takeUntil(this.destroy$)).subscribe(value => {
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
