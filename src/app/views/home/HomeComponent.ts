import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  NgZone,
  Output,
  EventEmitter,
  inject,
} from '@angular/core'
import { AngularYandexMapsModule, YaReadyEvent } from 'angular8-yandex-maps'
import {
  catchError,
  EMPTY,
  of,
  Subject,
  takeUntil,
  forkJoin,
  Observable,
  Subscribable,
  Subscription,
  interval,
} from 'rxjs'
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
import { SightTypeService } from 'src/app/services/sight-type.service'
import { EventTypeService } from 'src/app/services/event-type.service'
import { PlaceService } from 'src/app/services/place.service'
import { IPlace } from 'src/app/models/place'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { debounceTime, distinctUntilChanged, filter, take, tap, throttleTime } from 'rxjs/operators'
import { Options } from '@angular-slider/ngx-slider'
import { Title } from '@angular/platform-browser'
import { animate, style, transition, trigger } from '@angular/animations'
import { LoadingService } from 'src/app/services/loading.service'
import { LocationService } from 'src/app/services/location.service'
import { SwitchTypeService } from 'src/app/services/switch-type.service'
import { AuthService } from 'src/app/services/auth.service'
import { UserPointService } from 'src/app/services/user-point.service'

import { throttle } from 'lodash'
import moment from 'moment'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('panelInOut', [
      transition('void => *', [style({ transform: 'translateY(-100%)' }), animate(200)]),
      transition('* => void', [animate(200, style({ transform: 'translateY(-100%)' }))]),
      transition('* <=> *', [style({ height: '{{startHeight}}px', opacity: 0 }), animate('.2s ease')], {
        params: { startHeight: 0 },
      }),
    ]),
    trigger('mapAnimate', [
      transition('void <=> *', []),
      transition('* <=> *', [style({ height: '{{startHeight}}px', opacity: 0 }), animate('.5s ease')], {
        params: { startHeight: 0 },
      }),
    ]),
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  @ViewChild('buttonActive') buttonActive!: ElementRef
  @ViewChild('calendula') calendula!: ElementRef
  @ViewChild('calendulaWrapper') calendulaWrapper!: ElementRef
  host: string = environment.BACKEND_URL
  type: any
  sightTypeService: SightTypeService = inject(SightTypeService)
  eventTypeService: EventTypeService = inject(EventTypeService)
  port: string = environment.BACKEND_PORT
  renderSwitcher: boolean = false
  clustererOptions: ymaps.IClustererOptions = {
    preset: 'islands#greenClusterIcons',
  }
  map!: YaReadyEvent<ymaps.Map>
  placemarks: ymaps.Placemark[] = []
  placemarks_sights: ymaps.Placemark[] = []
  placemarks_now: ymaps.Placemark[] = []
  placemarks_today: ymaps.Placemark[] = []
  placemarks_tomorrow: ymaps.Placemark[] = []
  placemarks_week: ymaps.Placemark[] = []
  placemarks_month: ymaps.Placemark[] = []

  //настройки ползунка радиуса
  options: Options = {
    floor: 1,
    ceil: 25,
    vertical: true,

    getPointerColor: (value: number) => {
      return '#0085FF'
    },
  }

  CirclePoint!: ymaps.Circle

  doCheckState: boolean = true

  myGeo!: ymaps.Placemark
  minZoom = 9.4
  zoom: number = 4
  clusterer!: ymaps.Clusterer
  radius: number = 1
  date: any = {
    dateStart: new Date().toISOString(),
    dateEnd: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  }
  headerHeight: any = document.getElementById('header')
  headerHeightM: any = document.getElementById('header-m')

  objectsInsideCircle!: any
  pixelCenter: any

  isFilterChanged: boolean = false

  eventsLoading: boolean = false
  sightsLoading: boolean = false
  placeSubscribe!: Subscription
  sightSubscribe!: Subscription
  userHaveCoords: boolean = false
  userPointService: UserPointService = inject(UserPointService)
  filterChangeSubscribe!: Subscription
  currentTypesInMap: any[] = []
  stateType: string = 'events'

  selectedDateModalValue: boolean = false
  selectedDateItem: any = {}

  sightTypeId: any
  eventTypeId: any

  sightsContentModalTotal: number = 0
  eventsContentModalTotal: number = 0

  sightsModalNextPage: boolean = true
  eventsModalNextPage: boolean = true

  modalSpiner: boolean = false

  modalSwitcherClass: string = 'container-swither'
  modalSwitcherTextClass: string = 'swither-text'
  screenWidth: number = 0
  modalEventWait: boolean = true
  modalSightWait: boolean = true
  modalEventShowOpen: boolean = false
  modalEventRadiusShowOpen: boolean = false
  modalButtonLoader: boolean = false
  modalNewPageLoader: boolean = false
  modalContent: any[] = []
  activePlacemark?: any
  activeClaster?: any
  activeIcoLink: string = ''
  events: IEvent[] = []
  sights: ISight[] = []
  sightsContentModal: ISight[] = []
  openCalendarState: boolean = false
  eventsContentModal: IEvent[] = []
  places: IPlace[] = []
  allEventTypes: any[] = []
  allSightTypes: any[] = []
  radiusTimeOut: any
  loadModal: boolean = false
  loadModalMore: boolean = false
  isWorkingScroll: boolean = false
  mapClick: boolean = false
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
    private router: Router,
    private location: Location,
    private titleService: Title,
    private loadingService: LoadingService,
    private locationService: LocationService,
    private switchTypeService: SwitchTypeService,
    private authService: AuthService,
  ) {
    this.titleService.setTitle('VOKRUG - Мероприятия и достопремечательности вокруг вас')
    let prevPath = this.location.path()
  }

  // при клике по кнопке радиуча (5 10 15 20 25)
  setRadius(radius: number) {
    this.CirclePoint.geometry?.setRadius(1000 * radius)
    this.filterService.setRadiusTolocalStorage(radius.toString())
  }

  mapOnClick() {
    this.mapClick = !this.mapClick
  }

  setDir() {
    return null
  }

  pinRadiusFormatter(value: number) {
    return `${value} км.`
  }
  radiusChange(event: any) {
    if (this.radiusTimeOut) {
      clearTimeout(this.radiusTimeOut)
    }
    this.radiusTimeOut = setTimeout(() => {
      this.filterService.setRadiusTolocalStorage(event.value)
    }, 500)
  }
  radiusPlus() {
    let radius: number = Number(this.filterService.getRadiusFromlocalStorage())
    if (radius + 1 <= 25) {
      this.filterService.setRadiusTolocalStorage(`${radius + 1}`)
    }
  }

  openSelectDate() {
    this.selectedDateModalValue = true
  }

  closeSelectDate() {
    this.selectedDateModalValue = false
  }

  closeCalendar() {
    this.openCalendarState = false
    let date = {
      dateStart: moment(this.filterService.startDate.value).format('YYYY-MM-DD'),
      dateEnd: moment(this.filterService.endDate.value).format('YYYY-MM-DD'),
    }
    this.setDefaultValueInSelectDate(date)
  }
  selectDateItem(event: any) {
    if (event.value && event.value != 'Выбрать') {
      this.selectedDateItem = event
    } else {
      this.selectedDateItem = {
        name: 'Выбрать',
        value: 'Выбрать',
      }
      this.openCalendarState = true
    }
    let dateEvenet = {
      dateStart: '',
      dateEnd: '',
    }

    switch (event.value) {
      case 'Сегодня':
        dateEvenet.dateStart = moment().format('YYYY-MM-DD')
        dateEvenet.dateEnd = moment().format('YYYY-MM-DD')
        this.setDate(dateEvenet)
        break
      case 'Завтра':
        dateEvenet.dateStart = moment().add(1, 'days').format('YYYY-MM-DD')
        dateEvenet.dateEnd = moment().add(1, 'days').format('YYYY-MM-DD')
        this.setDate(dateEvenet)
        break
      case 'Выходные':
        dateEvenet.dateStart = moment().day(6).format('YYYY-MM-DD')
        dateEvenet.dateEnd = moment().day(7).format('YYYY-MM-DD')
        this.setDate(dateEvenet)
        break
      case 'Неделя':
        dateEvenet.dateStart = moment().format('YYYY-MM-DD')
        dateEvenet.dateEnd = moment().add(7, 'day').format('YYYY-MM-DD')
        this.setDate(dateEvenet)
        break
      default:
        null
        break
    }

    this.selectedDateModalValue = false
  }

  radiusMinus() {
    let radius: number = Number(this.filterService.getRadiusFromlocalStorage())
    if (radius - 1 >= 1) {
      this.filterService.setRadiusTolocalStorage(`${radius - 1}`)
    }
  }

  openModalSwitcher() {
    this.screenWidth = window.innerWidth
    if (this.screenWidth < 768) {
      if (this.modalSwitcherClass == 'container-swither') {
        this.modalSwitcherClass = 'container-swither_open'
        this.modalSwitcherTextClass = 'swither-text_open'
      } else {
        this.modalSwitcherClass = 'container-swither'
        this.modalSwitcherTextClass = 'swither-text'
      }
    } else {
      this.modalSwitcherClass = 'container-swither'
      this.modalSwitcherTextClass = 'swither-text'
    }
  }

  openModalContent() {
    this.navigationService.modalEventRadiusShowOpen.next(true)
  }

  setTypeState(type: string) {
    this.stateType = type

    this.getEventsAndSights()
    this.eventSightHeader()
  }

  changeTypeState() {
    this.switchTypeService.changeType()
  }
  eventSightHeader() {
    // if (this.stateType == 'sights') {
    //   this.calendulaWrapper.nativeElement.style.transform = 'translateY(-300%)'
    // } else {
    //   this.calendulaWrapper.nativeElement.style.transform = 'translateY(-0%)'
    // }
  }

  sightTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setSightTypesTolocalStorage([typeId])
      // this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      // this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setSightTypesTolocalStorage([])
      // this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      // this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    }
  }
  eventTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setEventTypesTolocalStorage([typeId, 5, 3])
      // this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      // this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setEventTypesTolocalStorage([])
      // this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
      // this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
      this.filterService.changeFilter.next(true)
    }
  }

  async onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map = { target, ymaps }
    let color = this.switchTypeService.currentType.value === 'sights' ? '#3880FF' : '#f7ab31'
    // Создаем и добавляем круг
    this.CirclePoint = new ymaps.Circle(
      [[11, 11], 1000 * this.radius],
      {},
      {
        fillOpacity: 0.8,
        draggable: false,
        strokeColor: color,
        fillColor: color,
      },
    )
    target.geoObjects.add(this.CirclePoint)

    // Определяем местоположение пользователя
    //Создаем метку в центре круга, для перетаскивания
    this.myGeo = new ymaps.Placemark(
      [0, 0],
      {},
      {
        iconLayout: 'default#image',
        iconImageHref: '',
        // iconImageHref: '/assets/my_geo.svg',
        iconImageSize: [60, 60],
        iconImageOffset: [-30, -55],
      },
    )
    target.geoObjects.add(this.myGeo)

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin', (e) => {
      if (this.objectsInsideCircle) {
        this.map.target.geoObjects.remove(this.objectsInsideCircle)

        this.objectsInsideCircle.remove(this.placemarks)
        this.placemarks = []
      }

      if (!this.navigationService.appFirstLoading.value) {
        color = this.switchTypeService.currentType.value === 'sights' ? '#3880FF' : '#f7ab31'
        this.eventsLoading = true
        this.sightsLoading = true
        this.modalButtonLoader = true
        this.CirclePoint.geometry?.setRadius(this.radius * 15)
        this.CirclePoint.options.set('fillOpacity', 0.7)
        this.CirclePoint.options.set('fillColor', color)
        this.CirclePoint.options.set('strokeWidth', 0)
        this.myGeo.options.set('iconImageOffset', [-30, -62])
      }
      this.cdr.detectChanges()
    })

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick', (e) => {
      const { globalPixelCenter, zoom } = e.get('tick')
      const projection = this.map.target.options.get('projection')
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom)
      this.CirclePoint.geometry!.setCoordinates(coords)
      this.myGeo.geometry!.setCoordinates(coords)
      this.mapService.circleCenterLongitude.next(coords[1])
      this.mapService.circleCenterLatitude.next(coords[0])
      this.mapService.setLastMapCoordsToLocalStorage(coords[0], coords[1])
    })

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend', async (e) => {
      if (!this.navigationService.appFirstLoading.value) {
        this.CirclePoint.geometry?.setRadius(this.radius * 1000)
        this.myGeo.options.set('iconImageOffset', [-30, -55])
        this.CirclePoint.options.set('fillColor', color)
        this.CirclePoint.options.set('fillOpacity', 0.15)
        this.CirclePoint.options.set('strokeWidth')
        this.getEventsAndSights()
        this.filterService.changeFilter.next(true)
      }
    })
    this.map.target.controls.remove('zoomControl')

    await this.mapService.positionFilter(this.map, this.CirclePoint).then(() => {

      this.getEventsAndSights()
    })

    if (this.navigationService.appFirstLoading.value) {
      this.eventsLoading = true
      this.sightsLoading = true
      this.modalButtonLoader = true
      this.cdr.detectChanges()
    }
  }

  setBoundsCoordsToMapService() {
    this.mapService.circleCenterLatitude.next(this.CirclePoint.geometry?.getCoordinates()![0]!)
    this.mapService.circleCenterLongitude.next(this.CirclePoint.geometry?.getCoordinates()![1]!)
  }

  createCluster(active: boolean = false) {
    let color = this.switchTypeService.currentType.value === 'sights' ? 'var(--blue-color)' : 'var(--orange-color)'
    if (active) {
      return ymaps.templateLayoutFactory.createClass(
        `<div class="cluster active" style="background-color: ${color};">{{ properties.geoObjects.length }}</div>`,
      )
    }
    return ymaps.templateLayoutFactory.createClass(
      `<div class="cluster" style="background-color: ${color};">{{ properties.geoObjects.length }}</div>`,
    )
  }

  async setPlacemarksAndClusters() {
    let eventsIds: any[] = []
    let sightIds: any[] = []
    //При изменении радиуса проверяем метки для показа/скрытия

    this.objectsInsideCircle = ymaps
      .geoQuery(this.placemarks)
      .searchInside(this.CirclePoint)
      .clusterize({
        clusterIconLayout: this.createCluster(),
        clusterDisableClickZoom: true,
        hasBalloon: false,
        gridSize: 64,
        clusterBalloonPanelMaxMapArea: 0,
        clusterOpenBalloonOnClick: true,
        clusterIconShape: {
          type: 'Rectangle',
          coordinates: [
            [0, 0],
            [40, 40],
          ],
        },
      })

    this.map.target.geoObjects.add(this.objectsInsideCircle)

    this.objectsInsideCircle.events.add('click', (e: any) => {
      this.modalContent = []
      if (!e.get('target')._clusterBounds) {
        if (e.get('target').properties.get('geoObjects') !== undefined) {
          e.get('target')
            .properties.get('geoObjects')
            .forEach((element: any) => {
              if (element.options._options.balloonContent.type == 'event') {
                eventsIds.push(element.options._options.balloonContent.event_id)
              } else {
                sightIds.push(element.options._options.balloonContent.id)
              }
              this.activeClaster = e.get('target')
              e.get('target').options.set('clusterIconLayout', this.createCluster(true))
            })
        } else {
          if (e.get('target').options._options.balloonContent.type == 'event') {
            eventsIds.push(e.get('target').options._options.balloonContent.event_id)
          } else {
            sightIds.push(e.get('target').options._options.balloonContent.id)
          }
          this.activePlacemark = e.get('target')

          this.type = e.get('target').options._options.balloonContent.type

          switch (e.get('target').options._options.balloonContent.type) {
            case 'event':
              e.get('target').options.set(
                'iconContentLayout',
                ymaps.templateLayoutFactory.createClass(
                  `<div class="marker event"> <img src="/assets/icons/ticket.svg"> </div>`,
                ),
              )
              break

            case 'sights':
              e.get('target').options.set(
                'iconContentLayout',
                ymaps.templateLayoutFactory.createClass(
                  `<div class="marker sight"> <img src="/assets/icons/ticket.svg"> </div>`,
                ),
              )
              break
          }
        }
        this.navigationService.modalEventShowOpen.next(true)
        if (eventsIds.length) {
          this.queryBuilderService.eventIds.next(eventsIds.toString())
          this.queryBuilderService.paginationModalEventsCurrentPage.next('')
          this.getEventsForIdsForModal()
          this.stateType = 'events'
        }

        if (sightIds.length) {
          this.queryBuilderService.sightIds.next(sightIds.toString())
          this.queryBuilderService.paginationModalSightsCurrentPage.next('')
          this.getSightsForIdsForModal()
          this.stateType = 'sights'
        }
      }
    })
  }

  getEventsForIdsForModal() {
    this.loadModal = true
    if (this.eventsModalNextPage && this.modalEventWait) {
      this.modalSpiner = true
      this.modalEventWait = false
      this.eventsService
        .getEvents(this.queryBuilderService.queryBuilder('eventsForMapModal'))
        .pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.loadModal = false
            this.loadModalMore = false
            console.log(err)
            return of(EMPTY)
          }),
        )
        .subscribe((response: any) => {
          this.loadModal = false
          this.loadModalMore = false
          this.modalSpiner = false

          if (response.events.next_cursor) {
            this.queryBuilderService.paginationModalEventsCurrentPage.next(response.events.next_cursor)
            this.eventsModalNextPage = true
          } else {
            this.queryBuilderService.paginationModalEventsCurrentPage.next('')
            this.eventsModalNextPage = false
          }

          this.modalContent.push(...response.events.data)
          this.modalEventWait = true
        })
    }
  }

  getSightsForIdsForModal() {
    this.loadModal = true

    if (this.sightsModalNextPage && this.modalSightWait) {
      this.modalContent.length ? (this.modalSpiner = true) : null
      this.modalSightWait = false
      this.sightsService
        .getSights(this.queryBuilderService.queryBuilder('sightsForMapModal'))
        .pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.loadModal = false
            this.loadModalMore = false
            console.log(err)
            return of(EMPTY)
          }),
        )
        .subscribe((response: any) => {
          this.modalSpiner = false
          this.loadModal = false
          this.loadModalMore = false
          if (response.sights.next_cursor) {
            this.sightsModalNextPage = true
            this.queryBuilderService.paginationModalSightsCurrentPage.next(response.sights.next_cursor)
          } else {
            this.sightsModalNextPage = false
          }
          response.sights.next_cursor
          this.modalContent.push(...response.sights.data)
          this.modalSightWait = true
        })
    }
  }

  getCurrentBounds() {
    // console.log(this.map.target.getBounds())
  }

  getPlacesIds(id: number, type: string): Observable<any> {
    return new Observable((observer) => {
      this.placeService
        .getPlaceById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          if (type == 'event') {
            this.ngZone.run(() => {
              response.places.event.type = 'events'
              this.modalContent.push(response.places.event)
            })
          }
          this.cdr.detectChanges()
          observer.next(EMPTY)
          observer.complete()
        })
    })
  }

  getSightsIds(id: number): Observable<any> {
    return new Observable((observer) => {
      this.sightsService
        .getSightById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          this.ngZone.run(() => {
            response.type = 'sights'
            this.modalContent.push(response)
          })
        })
    })
  }

  getPlaces(): Observable<any> {
    return new Observable((observer) => {
      this.eventsLoading = true
      if (this.placeSubscribe) {
        this.placeSubscribe.unsubscribe()
      }
      this.placeSubscribe = this.placeService
        .getPlaces(this.queryBuilderService.queryBuilder('placesForMap'))
        .pipe(takeUntil(this.destroy$), throttleTime(300))
        .subscribe((response: any) => {
          this.places = response.places
          this.cdr.detectChanges()
          observer.next(EMPTY)
          observer.complete()
        })
    })
  }

  getSightsForMap(): Observable<any> {
    return new Observable((observer) => {
      this.sightsLoading = true
      if (this.sightSubscribe) {
        this.sightSubscribe.unsubscribe()
      }
      this.sightSubscribe = this.sightsService
        .getSightsForMap(this.queryBuilderService.queryBuilder('sightsForMap'))
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          this.sights = response.sights
          this.filterService.setSightsCount(response.sights.length)
          //this.sightsLoading = false
          this.cdr.detectChanges()
          observer.next(EMPTY)
          observer.complete()
        })
    })
  }

  eventNavigation(event: any) {
    this.closeModal()
    setTimeout(() => {
      this.router.navigate(['/events', event])
    }, 0)
  }

  organizationNavigation(event: any) {
    this.closeModal()
    setTimeout(() => {
      this.router.navigate(['/organizations', event])
    }, 0)
  }
  getSights(more?: boolean): Observable<any> {
    return new Observable((observer) => {
      this.eventsLoading = true
      this.sightsService
        .getSights(this.queryBuilderService.queryBuilder('sightsModalRadiusForMap'))
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          if (response.sights.next_cursor != null) {
            this.sightsModalNextPage = true
          }
          if (more) {
            this.sightsContentModal.push(...response.sights.data)
          } else {
            this.sightsContentModal = response.sights.data
          }

          this.sightsContentModalTotal = response.total
          // this.filterService.setEventsCount(response.total)
          //this.sightsLoading = false
          this.cdr.detectChanges()
          observer.next(EMPTY)
          observer.complete()
        })
    })
  }

  getEvents(more?: boolean): Observable<any> {
    return new Observable((observer) => {
      this.eventsLoading = true
      this.eventsService
        .getEvents(this.queryBuilderService.queryBuilder('eventsModalRadiusForMap'))
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          if (response.events.next_cursor != null) {
            this.eventsModalNextPage = true
          } else {
            this.eventsModalNextPage = false
          }

          if (more) {
            this.eventsContentModal.push(...response.events.data)
          } else {
            this.eventsContentModal = response.events.data
          }
          this.eventsContentModalTotal = response.total
          // this.filterService.setEventsCount(response.total)
          //this.sightsLoading = false
          this.cdr.detectChanges()
          observer.next(EMPTY)
          observer.complete()
        })
    })
  }

  setMapData() {
    if (this.objectsInsideCircle) {
      this.map.target.geoObjects.remove(this.objectsInsideCircle)

      this.objectsInsideCircle.remove(this.placemarks)
      this.placemarks = []
    }
    //добавить в if - && this.navigationService.appFirstLoading.value - если не требуется увеличивать радиус после первого запуска
    if (
      !this.places.length &&
      !this.sights.length &&
      this.radius < 25 &&
      this.navigationService.appFirstLoading.value
    ) {
      // Увеличивает радиус пока не появятся точки
      // this.filterService.setRadiusTolocalStorage((++this.radius).toString())
      // this.CirclePoint.geometry?.setRadius(this.radius * 1000)
      // this.getEventsAndSights()
      this.navigationService.appFirstLoading.next(false)
      this.modalButtonLoader = true
      this.eventsLoading = false
      this.sightsLoading = false
    } else {
      this.navigationService.appFirstLoading.next(false)
      this.modalButtonLoader = true
      this.eventsLoading = false
      this.sightsLoading = false
    }

    //this.setPlacemarks(this.events, 'events');

    if (this.stateType == 'events') {
      this.setPlacemarks(this.places, 'event')
    } else if (this.stateType == 'sights') {
      this.setPlacemarks(this.sights, 'sights')
    } else if (this.stateType == 'all') {
      this.setPlacemarks(this.places, 'event')
      this.setPlacemarks(this.sights, 'sights')
    }

    this.setPlacemarksAndClusters()
    this.setBoundsCoordsToMapService()
    this.cdr.detectChanges()
  }

  deleteTypeInStorage(deleteType: any) {
    let selectedEventTypes: any = this.filterService.getEventTypesFromlocalStorage()?.split(',')
    let selectedSightTypes: any = this.filterService.getSightTypesFromlocalStorage()?.split(',')
    if (this.stateType === 'events') {
      selectedEventTypes = selectedEventTypes!.filter((type: any) => type != String(deleteType.id))
      selectedEventTypes.forEach((type: any) => Number(type))
      this.filterService.setEventTypesTolocalStorage(selectedEventTypes)
    } else {
      selectedSightTypes = selectedSightTypes!.filter((type: any) => type != String(deleteType.id))
      selectedSightTypes.forEach((type: any) => Number(type))
      this.filterService.setSightTypesTolocalStorage(selectedSightTypes)
    }
    this.filterService.changeFilter.next(true)
  }

  renderTypesInMap() {
    let selectedEventTypes = this.filterService.getEventTypesFromlocalStorage()?.split(',')
    let selectedSightTypes = this.filterService.getSightTypesFromlocalStorage()?.split(',')
    let showTypes: any = []
    if (this.stateType == 'sights') {
      if (this.sightTypeService.types) {
        showTypes = this.sightTypeService.types!.filter((type: any) => {
          return selectedSightTypes!.includes(String(type.id))
        })
      }
    } else {
      if (this.eventTypeService.types) {
        showTypes = this.eventTypeService.types!.filter((type: any) => {
          return selectedEventTypes!.includes(String(type.id))
        })
      }
    }
    return showTypes
  }
  setDefaultValueInSelectDate(date: any) {
    let { dateStart, dateEnd } = date
    dateStart = moment(dateStart)
    dateEnd = moment(dateEnd)

    if (dateStart.format('YYYY-MM-DD') == dateEnd.format('YYYY-MM-DD')) {
      if (moment().add(1, 'days').format('YYYY-MM-DD') == dateStart.format('YYYY-MM-DD')) {
        this.selectedDateItem = {
          name: 'Завтра',
          value: 'Завтра',
        }
      }
      if (moment().format('YYYY-MM-DD') == dateStart.format('YYYY-MM-DD')) {
        this.selectedDateItem = {
          name: 'Сегодня',
          value: 'Сегодня',
        }
      }
    } else if (dateStart.day() == 6 && dateEnd.day() == 0) {
      this.selectedDateItem = {
        name: 'Выходные',
        value: 'Выходные',
      }
    } else if (dateStart.diff(dateEnd, 'days') == -7) {
      this.selectedDateItem = {
        name: 'Неделя',
        value: 'Неделя',
      }
    } else {
      this.selectedDateItem = {
        name: `${moment(dateStart).format('D MMM')} - ${moment(dateEnd).format('D MMM')}`,
      }
    }
  }
  setPlacemarks(collection: any, type: string) {
    collection.map((item: any) => {
      let time_event = Math.ceil(new Date(item.date_start).getTime() / 1000)
      let time_now = Math.ceil(new Date().getTime() / 1000)
      let time_deff = time_event - time_now

      item['type'] = type
      //let icoLink = item && item.types && item.types.length ? this.host + ':' + this.port + item.types[0].ico : '';
      let icoLink = 0
      let placemark
      // console.log(item.ico)
      if (item.type === 'event') {
        let icoLink = this.host + ':' + this.port + item.ico
        let marker

        if (icoLink.length > 0) {
          marker = `<div class="marker event"> <img src="/assets/icons/ticket.svg"> </div>`
        } else {
          marker = `<div class="marker event"> <img src="/assets/icons/ticket.svg"> </div>`
        }

        placemark = new ymaps.Placemark(
          [item.latitude, item.longitude],
          {},
          {
            preset: 'islands#circleIcon',
            balloonContent: item,
            balloonAutoPan: false,

            iconContentLayout: ymaps.templateLayoutFactory.createClass(marker),
          },
        )
        this.placemarks.push(placemark)
      } else {
        let marker
        // let icoLink
        // if (item.types && item.types.length) {
        //   icoLink = `${this.host}:${this.port}${item.types[0].ico}`
        // } else {
        //   icoLink = ''
        // }

        marker = `<div class="marker sight"> <img src="/assets/icons/ticket.svg"> </div>`
        placemark = new ymaps.Placemark(
          [item.latitude, item.longitude],
          {},
          {
            preset: 'islands#circleIcon',
            balloonContent: item,
            balloonAutoPan: false,
            // С иконкой
            iconContentLayout: ymaps.templateLayoutFactory.createClass(marker),
          },
        )
        this.placemarks.push(placemark)
      }
    })
  }
  async getEventsAndSights() {
    this.modalButtonLoader = true
    this.eventsModalNextPage = true
    this.sightsModalNextPage = true
    this.eventsContentModal = []
    this.sightsContentModal = []
    const sources: any[] = []
    if (
      this.stateType == 'events' &&
      this.mapService.circleCenterLongitude.value &&
      this.mapService.circleCenterLatitude.value
    ) {
      sources.push(this.getPlaces())
    } else if (this.stateType == 'sights') {
      sources.push(this.getSightsForMap())
    }

    forkJoin(sources)
      .pipe(
        catchError((err) => {
          this.toastService.showToast(MessagesErrors.default, 'danger')
          this.navigationService.appFirstLoading.next(false)
          this.eventsLoading = false
          this.sightsLoading = false
          this.cdr.detectChanges()
          return of(EMPTY)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        if (this.doCheckState) {
          this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {
            checkZoomRange: true,
          })
          this.doCheckState = false
        }
        this.setMapData()
      })
  }

  modalClose() {
    this.navigationService.modalEventShowOpen.next(false)
  }

  modalRadiusClose() {
    this.navigationService.modalEventRadiusShowOpen.next(false)
  }

  onSegmentChanged(event: any, p: number) {
    if (p == 1) {
      this.buttonActive.nativeElement.style.transform = 'translateY(0px)'
      // this.calendula.nativeElement.style.top = this.headerHeight.offsetHeight + "px"
    } else if (p == 2) {
      this.buttonActive.nativeElement.style.transform = 'translateY(40px)'
      // this.calendula.nativeElement.style.top = "-100px"
    } else if (p == 3) {
      this.buttonActive.nativeElement.style.transform = 'translateY(92px)'
    }
  }
  changeDateRange(event: any) {
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

  dropButton(event: any) {
    switch (Number(event)) {
      case 1:
        this.getGeoPosition()
        break
      case 2:
        this.loadingService.showLoading()
        if (this.filterService.locationId.value && !this.authService.authenticationState.value) {
          this.locationService
            .getLocationsIds(this.filterService.locationId.value)
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                this.toastService.showToast('Город не указан', 'primary')
                this.loadingService.hideLoading()
                console.log(err)
                return of(EMPTY)
              }),
            )
            .subscribe((res: any) => {
              if (res.location.latitude && res.location.longitude) {
                this.mapService.circleCenterLatitude.next(res.location.latitude)
                this.mapService.circleCenterLongitude.next(res.location.longitude)
                this.mapService.geolocationLatitude.next(res.location.latitude)
                this.mapService.geolocationLongitude.next(res.location.longitude)
                this.mapService.setLastMapCoordsToLocalStorage(res.location.latitude, res.location.longitude)

                // this.map.target.setCenter([
                //   res.location.latitude,
                //   res.location.longitude,
                // ]);
                this.filterService.changeFilter.next(true)
                this.filterService.changeCityFilter.next(true)
                this.loadingService.hideLoading()
                this.cdr.detectChanges()
              }
            })
        } else if (this.authService.authenticationState.value) {
          let coordState = this.mapService.goHomeCoords()
          if (!coordState) {
            this.router.navigate(['/cabinet/location'])
            this.toastService.showToast('Добавьте домашний адрес', 'info')
          }
          this.loadingService.hideLoading()
          this.cdr.detectChanges()
        } else {
          this.loadingService.hideLoading()
          this.navigationService.modalSearchCityesOpen.next(true)
        }
        break
      case 3:
        this.navigationService.modalSearchCityesOpen.next(true)
        break
      default:
        break
    }
  }

  getGeoPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = [position.coords.latitude, position.coords.longitude]
          this.map.target.setCenter(coordinates)
        },
        (error) => {
          this.toastService.showToast('Убедитесь что доступ к геолокации предоставлен', 'warning')
        },
      )
    }
  }

  // ngAfterContentInit() {
  //   setTimeout(() => {
  //     this.filterService.changeFilter.next(true);
  //   }, 3000);
  // }

  // ngAfterViewChecked() {
  //   if (this.doCheckState == true) {
  //     console.log('check');
  //     this.doCheckState = false;
  //   }
  // }

  nextPageModal = (): void => {
    if (!this.isWorkingScroll) {
      const boundingClientRect = document.getElementById('modalShowContent')!.getBoundingClientRect()
      if (
        boundingClientRect.bottom <= window.innerHeight * 1.5 &&
        !(boundingClientRect.bottom <= window.innerHeight) &&
        !this.loadModalMore &&
        this.modalContent.length
      ) {
        if (this.stateType == 'events' && this.queryBuilderService.paginationModalEventsCurrentPage.value) {
          this.loadModalMore = true
          this.getEventsForIdsForModal()
        } else if (this.queryBuilderService.paginationModalSightsCurrentPage.value && this.stateType == 'sights') {
          this.loadModalMore = true
          this.getSightsForIdsForModal()
        }
      }
      setTimeout(() => {
        this.isWorkingScroll = false
      }, 300)
    }
  }

  setZoomFromRadius() {
    if (this.mapService.getRadiusFromLocalStorage()) {
      switch (Number(this.mapService.getRadiusFromLocalStorage())) {
        case 1:
          this.zoom = 14
          break
        case 2:
          this.zoom = 13
          break
        case 5:
          this.zoom = 11.7
          break
        case 10:
          this.zoom = 10.8
          break
        case 25:
          this.zoom = 9.4
          break
        default:
          break
      }
    } else {
      this.zoom = 13
    }
  }

  setDateInSelected(event: any) {
    let dateValue = event.dateStart
    if (event.dateStart == event.dateEnd) {
      dateValue = moment(event.dateStart).format('D MMM')
    } else {
      dateValue = `${moment(event.dateStart).format('D MMM')} - ${moment(event.dateEnd).format('D MMM')}`
    }
    this.selectedDateItem = {
      name: `${dateValue}`,
      value: 'Выбрать',
    }
    this.setDate(event)
  }

  openCalendar(event: any) {
    event.open()
  }

  ionViewWillEnter(): void {
    this.renderSwitcher = !this.renderSwitcher
    //Подписываемся на изменение радиуса
    this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.eventsContentModal = []
      this.sightsContentModal = []
      this.radius = parseInt(value)
      this.mapService.setRadius(Number(value))
      this.setZoomFromRadius()
      this.mapService.radius.subscribe((value: any) => {
        this.setZoomFromRadius()
      })
    })
    this.date = {
      dateStart: this.filterService.startDate.value,
      dateEnd: this.filterService.endDate.value,
    }
    this.setDefaultValueInSelectDate(this.date)
    //Подписываемся на состояние модалки показа ивентов и мест
    this.navigationService.modalEventShowOpen.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.modalEventShowOpen = value
      if (!value && this.activePlacemark) {
        // убираем активный класс у кастомного маркера при закрытие модалки
        this.setMapData()
      }
      if (!value && this.activeClaster) {
        // убираем активный класс у кластера при закрытие модалки
        this.activeClaster.options.set('preset')
        this.setMapData()
      }
      this.cdr.detectChanges()
    })

    this.navigationService.modalEventRadiusShowOpen.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.modalEventRadiusShowOpen = value
      this.cdr.detectChanges()
    })

    //Подписываемся на изменение фильтра и если было изменение города, то перекинуть на выбранный город.
    this.filterService.changeFilter.pipe(takeUntil(this.destroy$), throttleTime(300)).subscribe((value) => {
      if (value === true) {
        this.eventsContentModal = []
        this.sightsContentModal = []
        if (this.filterService.changeCityFilter.value == true) {
          this.mapService.positionFilter(this.map, this.CirclePoint)
        }
        if (this.filterService.locationLatitude && this.filterService.locationLongitude) {
          this.getEventsAndSights()
        }
        this.currentTypesInMap = this.renderTypesInMap()

        this.loadingService.hideLoading()
      }
    })
    this.filterService.sightTypes.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.eventsContentModal = []
      this.sightsContentModal = []
      this.sightTypeId = value[0]
    })
    this.filterService.eventTypes.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.eventsContentModal = []
      this.sightsContentModal = []
      this.eventTypeId = value[0]
    })

    this.switchTypeService.currentType.pipe(takeUntil(this.destroy$)).subscribe((value: string) => {
      let color = value === 'sights' ? '#3880FF' : '#f7ab31'
      this.CirclePoint?.options.set('fillColor', color)
      this.CirclePoint?.options.set('strokeColor', color)
      this.setTypeState(value)
      this.renderTypesInMap()
    })
    // window.addEventListener('scroll', this.nextPageModal, true)
  }
  ngOnInit(): void {}

  closeModal() {
    this.modalEventShowOpen = false
    this.getEventsAndSights()
  }
  ionViewDidLeave() {
    this.navigationService.modalEventShowOpen.next(false)
    this.destroy$.next()
    this.destroy$.complete()
  }
  ngOnDestroy() {
    // отписываемся от всех подписок

    this.destroy$.next()
    this.destroy$.complete()
  }
}
