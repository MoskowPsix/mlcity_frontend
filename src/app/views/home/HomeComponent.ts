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
} from '@angular/core'
import { YaReadyEvent } from 'angular8-yandex-maps'
import {
  catchError,
  EMPTY,
  of,
  Subject,
  takeUntil,
  forkJoin,
  Observable,
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
import { PlaceService } from 'src/app/services/place.service'
import { IPlace } from 'src/app/models/place'
import { Metrika } from 'ng-yandex-metrika'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { filter } from 'rxjs/operators'
import { Options } from '@angular-slider/ngx-slider'
import { Title } from '@angular/platform-browser'
import { animate, style, transition, trigger } from '@angular/animations'
import { LoadingService } from 'src/app/services/loading.service'
import { LocationService } from 'src/app/services/location.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('panelInOut', [
      transition('void => *', [
        style({ transform: 'translateY(-100%)' }),
        animate(200),
      ]),
      transition('* => void', [
        animate(200, style({ transform: 'translateY(-100%)' })),
      ]),
      transition(
        '* <=> *',
        [
          style({ height: '{{startHeight}}px', opacity: 0 }),
          animate('.2s ease'),
        ],
        { params: { startHeight: 0 } },
      ),
    ]),
    trigger('mapAnimate', [
      transition('void <=> *', []),
      transition(
        '* <=> *',
        [
          style({ height: '{{startHeight}}px', opacity: 0 }),
          animate('.5s ease'),
        ],
        { params: { startHeight: 0 } },
      ),
    ]),
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  @ViewChild('buttonActive') buttonActive!: ElementRef
  @ViewChild('calendula') calendula!: ElementRef
  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

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
  minZoom = 4
  zoom: number = 4
  clusterer!: ymaps.Clusterer
  radius: number = 1
  date: any = {
    dateStart: new Date().toISOString(),
    dateEnd: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 7,
    ).toISOString(),
  }
  headerHeight: any = document.getElementById('header')
  headerHeightM: any = document.getElementById('header-m')

  objectsInsideCircle!: any
  pixelCenter: any

  isFilterChanged: boolean = false

  eventsLoading: boolean = false
  sightsLoading: boolean = false
  stateType: string = 'events'

  sightTypeId: any
  eventTypeId: any

  sightsContentModalTotal: number = 0
  eventsContentModalTotal: number = 0

  sightsModalNextPage!: string
  eventsModalNextPage!: string

  modalSwitcherClass: string = 'container-swither'
  modalSwitcherTextClass: string = 'swither-text'
  screenWidth: number = 0

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
  eventsContentModal: IEvent[] = []
  places: IPlace[] = []
  radiusTimeOut: any
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
    private metrika: Metrika,
    private router: Router,
    private location: Location,
    private titleService: Title,
    private loadingService: LoadingService,
    private locationService: LocationService,
  ) {
    this.titleService.setTitle(
      'MLCity - Мероприятия и достопремечательности вокруг вас',
    )
    let prevPath = this.location.path()
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const newPath = location.path()
        this.metrika.hit(newPath, {
          referer: prevPath,
        })
        prevPath = newPath
      })
  }

  // при клике по кнопке радиуча (5 10 15 20 25)
  setRadius(radius: number) {
    this.CirclePoint.geometry?.setRadius(1000 * radius)
    this.filterService.setRadiusTolocalStorage(radius.toString())
  }

  mapOnClick() {
    console.log('Клик на карту из родительского компонента')
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

  sightTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setSightTypesTolocalStorage([typeId])
      this.filterService.setLocationLatitudeTolocalStorage(
        this.mapService.circleCenterLatitude.value.toString(),
      )
      this.filterService.setLocationLongitudeTolocalStorage(
        this.mapService.circleCenterLongitude.value.toString(),
      )
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setSightTypesTolocalStorage([])
      this.filterService.setLocationLatitudeTolocalStorage(
        this.mapService.circleCenterLatitude.value.toString(),
      )
      this.filterService.setLocationLongitudeTolocalStorage(
        this.mapService.circleCenterLongitude.value.toString(),
      )
      this.filterService.changeFilter.next(true)
    }
  }
  eventTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setEventTypesTolocalStorage([typeId])
      this.filterService.setLocationLatitudeTolocalStorage(
        this.mapService.circleCenterLatitude.value.toString(),
      )
      this.filterService.setLocationLongitudeTolocalStorage(
        this.mapService.circleCenterLongitude.value.toString(),
      )
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setEventTypesTolocalStorage([])
      this.filterService.setLocationLatitudeTolocalStorage(
        this.mapService.circleCenterLatitude.value.toString(),
      )
      this.filterService.setLocationLongitudeTolocalStorage(
        this.mapService.circleCenterLongitude.value.toString(),
      )
      this.filterService.changeFilter.next(true)
    }
  }

  async onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map = { target, ymaps }

    // Создаем и добавляем круг
    this.CirclePoint = new ymaps.Circle(
      [[11, 11], 1000 * this.radius],
      {},
      { fillOpacity: 0.15, draggable: false },
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
        this.eventsLoading = true
        this.sightsLoading = true
        this.modalButtonLoader = true
        this.CirclePoint.geometry?.setRadius(this.radius * 15)
        this.CirclePoint.options.set('fillOpacity', 0.7)
        this.CirclePoint.options.set('fillColor', '#474A51')
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
      console.log(this.map.target.getBounds())
      this.mapService.circleCenterLongitude.next(coords[1])
      this.mapService.circleCenterLatitude.next(coords[0])
      this.mapService.setLastMapCoordsToLocalStorage(coords[0], coords[1])
    })

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend', async (e) => {
      if (!this.navigationService.appFirstLoading.value) {
        this.CirclePoint.geometry?.setRadius(this.radius * 1000)
        this.myGeo.options.set('iconImageOffset', [-30, -55])
        this.CirclePoint.options.set('fillColor')
        this.CirclePoint.options.set('fillOpacity', 0.15)
        this.CirclePoint.options.set('strokeWidth')
        this.getEventsAndSights()
      }
    })
    this.map.target.controls.remove('zoomControl')
    // this.map.target.controls.add('geolocationControl',{size:"large",position: {left:'50% ',bottom:0, right:0, top:"-150px",width:"150px"}})

    // if (!this.map) {
    //   this.onMapReady({target, ymaps});
    // }
    await this.mapService
      .positionFilter(this.map, this.CirclePoint)
      .then(() => {
        this.getEventsAndSights()
      })

    if (this.navigationService.appFirstLoading.value) {
      this.eventsLoading = true
      this.sightsLoading = true
      this.modalButtonLoader = true
      this.cdr.detectChanges()
      //this.getEvents()
    }
    // setTimeout(() => {
    //   this.filterService.changeFilter.next(true);
    // }, 1000);
    // this.getEventsAndSights()
  }

  setBoundsCoordsToMapService() {
    this.mapService.circleCenterLatitude.next(
      this.CirclePoint.geometry?.getCoordinates()![0]!,
    )
    this.mapService.circleCenterLongitude.next(
      this.CirclePoint.geometry?.getCoordinates()![1]!,
    )
  }

  async setPlacemarksAndClusters() {
    //При изменении радиуса проверяем метки для показа/скрытия
    this.objectsInsideCircle = ymaps
      .geoQuery(this.placemarks)
      .searchInside(this.CirclePoint)
      .clusterize({
        hasBalloon: false,
        clusterBalloonPanelMaxMapArea: 0,
        clusterOpenBalloonOnClick: true,
      })
    this.map.target.geoObjects.add(this.objectsInsideCircle)

    this.objectsInsideCircle.events.add('click', (e: any) => {
      this.modalContent = []

      if (!e.get('target')._clusterBounds) {
        if (e.get('target').properties.get('geoObjects') !== undefined) {
          e.get('target')
            .properties.get('geoObjects')
            .forEach((element: any) => {
              if (element.options._options.balloonContent.type === 'event') {
                forkJoin([
                  this.getPlacesIds(
                    element.options._options.balloonContent.id,
                    'event',
                  ),
                ])
                  .pipe(
                    catchError((err) => {
                      return of(EMPTY)
                    }),
                    takeUntil(this.destroy$),
                  )
                  .subscribe()

                this.activeClaster = e.get('target')
                e.get('target').options.set(
                  'preset',
                  'islands#invertedPinkClusterIcons',
                )
              } else {
                this.modalContent.push(element.options._options.balloonContent)
                this.activeClaster = e.get('target')
                e.get('target').options.set(
                  'preset',
                  'islands#invertedPinkClusterIcons',
                )
              }
            })
        } else {
          if (
            e.get('target').options._options.balloonContent.type === 'event'
          ) {
            forkJoin([
              this.getPlacesIds(
                e.get('target').options._options.balloonContent.id,
                'event',
              ),
            ])
              .pipe(
                catchError((err) => {
                  return of(EMPTY)
                }),
                takeUntil(this.destroy$),
              )
              .subscribe()
            this.activePlacemark = e.get('target')
            this.activeIcoLink =
              this.host +
              ':' +
              this.port +
              e.get('target').options._options.balloonContent.ico
            e.get('target').options.set(
              'iconContentLayout',
              ymaps.templateLayoutFactory.createClass(
                `<div class="marker active"><img src="${this.activeIcoLink}"/></div>`,
              ),
            )
          } else {
            forkJoin([
              this.getSightsIds(
                e.get('target').options._options.balloonContent.id,
              ),
            ])
              .pipe(
                catchError((err) => {
                  return of(EMPTY)
                }),
                takeUntil(this.destroy$),
              )
              .subscribe(() => {})
            this.activePlacemark = e.get('target')
            this.activeIcoLink =
              this.host +
              ':' +
              this.port +
              e.get('target').options._options.balloonContent.types[0].ico

            e.get('target').options.set(
              'iconContentLayout',
              ymaps.templateLayoutFactory.createClass(
                `<div class="marker active"><img src="${this.activeIcoLink}"/></div>`,
              ),
            )
          }
        }

        this.navigationService.modalEventShowOpen.next(true)
      }
    })
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
      this.placeService
        .getPlaces(this.queryBuilderService.queryBuilder('placesForMap'))
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          this.places = response.places
          // console.log(this.filterService.locationLatitude.value, this.filterService.locationLongitude.value)
          // let events: any[] = []
          // if (response.places.length) {

          // }
          this.cdr.detectChanges()
          observer.next(EMPTY)
          observer.complete()
        })
    })
  }

  getSightsForMap(): Observable<any> {
    return new Observable((observer) => {
      this.sightsLoading = true
      this.sightsService
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

  getSights(more?: boolean): Observable<any> {
    return new Observable((observer) => {
      this.eventsLoading = true
      this.sightsService
        .getSights(
          this.queryBuilderService.queryBuilder('sightsModalRadiusForMap'),
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          if (response.sights.next_cursor != null) {
            this.sightsModalNextPage = response.sights.next_cursor
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
        .getEvents(
          this.queryBuilderService.queryBuilder('eventsModalRadiusForMap'),
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          if (response.events.next_cursor != null) {
            this.eventsModalNextPage = response.events.next_cursor
          } else {
            this.eventsModalNextPage = ''
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
      this.filterService.setRadiusTolocalStorage((++this.radius).toString())
      this.CirclePoint.geometry?.setRadius(this.radius * 1000)
      this.getEventsAndSights()
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
          marker = `<div style="border-color: #7df088;" class="marker"><img style="color:#008aed;" src="${icoLink}"/></div>`
        } else {
          marker = `<div style="border-color: #7df088;" class="marker"><img style="color:#008aed;"/></div>`
        }

        placemark = new ymaps.Placemark(
          [item.latitude, item.longitude],
          {},
          {
            balloonContent: item,
            balloonAutoPan: false,
            // С иконкой
            // iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #7df088;" class="marker"><img src="${icoLink}"/></div>`)
            iconContentLayout: ymaps.templateLayoutFactory.createClass(marker),
          },
        )
        this.placemarks.push(placemark)
      } else {
        let marker
        let icoLink = `${this.host}:${this.port}${item.types[0].ico}`
        if (item.types[0].ico.length > 0) {
          marker = `<div style="border-color: #6574fc;" class="marker"><img style="color:#008aed;" src="${icoLink}"/></div>`
        } else {
          marker = `<div style="border-color: #6574fc;" class="marker"></div>`
        }
        placemark = new ymaps.Placemark(
          [item.latitude, item.longitude],
          {},
          {
            balloonContent: item,
            balloonAutoPan: false,
            // С иконкой
            // iconContentLayout: ymaps.templateLayoutFactory.createClass(`<div style="border-color: #6574fc;" class="marker"><img src="${icoLink}"/></div>`)
            iconContentLayout: ymaps.templateLayoutFactory.createClass(marker),
          },
        )
        this.placemarks.push(placemark)
      }
    })
  }

  async getEventsAndSights() {
    this.modalButtonLoader = true
    this.eventsModalNextPage = ''
    this.sightsModalNextPage = ''
    this.eventsContentModal = []
    this.sightsContentModal = []
    const sources: any[] = []
    if (this.stateType == 'events') {
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
    this.filterService.setLocationLatitudeTolocalStorage(
      this.mapService.circleCenterLatitude.value.toString(),
    )
    this.filterService.setLocationLongitudeTolocalStorage(
      this.mapService.circleCenterLongitude.value.toString(),
    )
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
        if (this.filterService.locationId.value) {
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
                this.mapService.circleCenterLongitude.next(
                  res.location.longitude,
                )
                this.mapService.geolocationLatitude.next(res.location.latitude)
                this.mapService.geolocationLongitude.next(
                  res.location.longitude,
                )
                this.mapService.setLastMapCoordsToLocalStorage(
                  res.location.latitude,
                  res.location.longitude,
                )
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
          const coordinates = [
            position.coords.latitude,
            position.coords.longitude,
          ]
          this.map.target.setCenter(coordinates)
        },
        (error) => {
          this.toastService.showToast(
            'Убедитесь что доступ к геолокации предоставлен',
            'warning',
          )
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

  ngOnInit(): void {
    //Подписываемся на изменение радиуса
    this.filterService.radius
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.eventsContentModal = []
        this.sightsContentModal = []
        this.radius = parseInt(value)
        if (this.map && this.map.target)
          this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {
            checkZoomRange: true,
          })
      })

    //Подписываемся на состояние модалки показа ивентов и мест
    this.navigationService.modalEventShowOpen
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.modalEventShowOpen = value
        if (!value && this.activePlacemark) {
          // убираем активный класс у кастомного маркера при закрытие модалки
          this.activePlacemark.options.set(
            'iconContentLayout',
            ymaps.templateLayoutFactory.createClass(
              `<div class="marker"><img src="${this.activeIcoLink}"/></div>`,
            ),
          )
          this.setMapData()
        }
        if (!value && this.activeClaster) {
          // убираем активный класс у кластера при закрытие модалки
          this.activeClaster.options.set('preset', '')
          this.setMapData()
        }
        this.cdr.detectChanges()
      })

    this.navigationService.modalEventRadiusShowOpen
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.modalEventRadiusShowOpen = value
        this.cdr.detectChanges()
      })

    //Подписываемся на изменение фильтра и если было изменение города, то перекинуть на выбранный город.
    this.filterService.changeFilter
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value === true) {
          this.eventsContentModal = []
          this.sightsContentModal = []
          this.mapService.positionFilter(this.map, this.CirclePoint)

          this.getEventsAndSights()
          this.loadingService.hideLoading()
        }
      })
    this.filterService.sightTypes
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.eventsContentModal = []
        this.sightsContentModal = []
        this.sightTypeId = value[0]
      })
    this.filterService.eventTypes
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.eventsContentModal = []
        this.sightsContentModal = []
        this.eventTypeId = value[0]
      })
    // this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
    //   this.filterService.changeFilter.next(true);
    // });
    // this.getEventsAndSights();
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
