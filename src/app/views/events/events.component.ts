import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentInit,
  ChangeDetectionStrategy,
  HostListener,
  inject,
} from '@angular/core'

import {
  catchError,
  delay,
  EMPTY,
  map,
  of,
  retry,
  Subject,
  takeUntil,
  tap,
  debounceTime,
  filter,
  last,
  finalize,
} from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { IEvent } from 'src/app/models/event'
import { EventsService } from 'src/app/services/events.service'
import { ToastService } from 'src/app/services/toast.service'
import { FilterService } from 'src/app/services/filter.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { NavigationService } from 'src/app/services/navigation.service'
import { LocationService } from 'src/app/services/location.service'
import { register } from 'swiper/element'
import { Location } from '@angular/common'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'
import { BehaviorSubject } from 'rxjs'
import { MapService } from 'src/app/services/map.service'
import { Capacitor } from '@capacitor/core'
import { Router } from '@angular/router'
import { SwitchTypeService } from 'src/app/services/switch-type.service'
import { CalendarComponent } from 'src/app/components/calendar/calendar.component'
import { IonContent } from '@ionic/angular'
import { EventsTapeService } from 'src/app/services/events-tape.service'
register()

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],

  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  @ViewChild('ContentCol') ContentCol!: ElementRef
  @ViewChild('headerWrapper') headerWrapper!: ElementRef
  @ViewChild(IonContent) ionContent!: IonContent
  city: string = ''
  segment: string = 'eventsCitySegment'
  isFirstNavigation: any = new BehaviorSubject<boolean>(true)
  date: any
  spiner: boolean = false
  eventsGeolocation: IEvent[] = []
  headerClassName: string = 'header'
  wait: boolean = true
  scrollStart: any
  switchTypeService: SwitchTypeService = inject(SwitchTypeService)

  @ViewChild('cardContainer')
  cardContainer!: ElementRef
  @ViewChild('widgetsContent') widgetsContent!: ElementRef
  @ViewChild('lentEvent') lent!: ElementRef
  @ViewChild('headerTools') headerTools!: ElementRef
  @ViewChild('headerBlock') header!: ElementRef
  @ViewChild('headerToolsSearch') headerToolsSearch!: ElementRef

  loadingEventsCity: boolean = false
  loadingEventsGeolocation: boolean = false

  searchActive: boolean = false

  loadingMoreEventsCity: boolean = false
  loadingMoreEventsGeolocation: boolean = false

  currentPageEventsCity: number = 1
  currentPageEventsGeolocation: number = 1

  timeStart: number = 0
  timeEnd: number = 0
  viewId: number[] = []

  viewElementTimeStart: number = 0
  viewElementTimeEnd: number = 0

  event_id: number = 0
  events_ids: any[] = []
  loadTrue: boolean = false

  eventTypeId: any
  sightTypeId: any

  testScrol: any = 0
  notFound: boolean = false
  scrollUpState: boolean = true

  platformType: any = Capacitor.getPlatform()

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private router: Router,
    public eventsTapeService: EventsTapeService,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
    private mapService: MapService,
  ) {}

  scrollUp() {
    document.getElementById('topEv')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  openCitySearch() {
    this.navigationService.modalSearchCityesOpen.next(true)
  }

  searchNavigate(event: any) {
    this.router.navigate(['/events/search/', event])
  }

  eventNavigation(event: any) {
    this.router.navigate(['/events', event])
  }

  scrollUpCheckState() {
    const boundingClientRect = this.ContentCol?.nativeElement.getBoundingClientRect()
    boundingClientRect ? (this.scrollUpState = boundingClientRect.y > 0) : (this.scrollUpState = false)
  }

  getEventsCity() {
    this.updateCoordinates().then(() => {
      if (this.eventsTapeService.nextPage && !this.eventsTapeService.wait) {
        this.eventsTapeService.wait = true
        //Спинер если запрос не первый
        if (this.eventsTapeService.eventsCity.length > 0 || this.eventsTapeService.eventsSeparator.length > 0) {
          this.spiner = true
        }
        this.eventsService
          .getEvents(this.queryBuilderService.queryBuilder('eventsForTape'))
          .pipe(
            debounceTime(1000),
            takeUntil(this.destroy$),
            finalize(() => {
              if (this.eventsTapeService.eventsCity.length === 0) {
                this.eventsTapeService.notFound = true
                console.log(this.eventsTapeService.eventsCity)
              }
            }),
            catchError((error) => {
              this.toastService.showToast(MessagesErrors.default, 'danger')
              console.error(error)
              return EMPTY
            }),
          )
          .subscribe((response: any) => {
            //Выключаю спинер
            this.spiner = false

            //Проверяем курсор
            let cursor = response.events.next_cursor
            if (cursor) {
              this.queryBuilderService.paginationPublicEventsForTapeCurrentPage.next(cursor)
              this.eventsTapeService.nextPage = true
            } else {
              this.eventsTapeService.nextPage = false
            }
            if (
              response.events.data[0] &&
              response.events.data[0].distance < Number(this.filterService.getRadiusFromlocalStorage())
            ) {
              response.events.data.forEach((event: any) => {
                if (event.distance < Number(this.filterService.getRadiusFromlocalStorage())) {
                  this.eventsTapeService.eventsCity.push(event)
                } else {
                  this.eventsTapeService.eventsSeparator.push(event)
                  if (this.eventsTapeService.eventsSeparator.length < 8) {
                    this.getEventsCity()
                  }
                }
              })
            } else {
              this.eventsTapeService.eventsSeparator.push(...response.events.data)
            }

            this.eventsTapeService.wait = false
          })
      }
    })
  }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value
  }

  scrollEvent = (): void => {}

  carusel(status: string) {
    if (status == 'hidden') {
    } else {
    }
  }

  timerReload() {
    this.timeStart = new Date().getTime()
  }
  eventTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setEventTypesTolocalStorage([typeId])
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setEventTypesTolocalStorage([])
      this.filterService.changeFilter.next(true)
    }
  }
  //скролл
  scrollPaginate = (): void => {
    this.scrollUpCheckState()
    const boundingClientRect = this.ContentCol.nativeElement?.getBoundingClientRect()
    if (this.testScrol == 0) {
      this.testScrol = boundingClientRect.y
      this.headerWrapper.nativeElement.style.transform = 'translateY(-2%)'
    }
    if (boundingClientRect.y > this.testScrol) {
      this.headerWrapper.nativeElement.style.transform = 'translateY(-2%)'
    }
    if (boundingClientRect.y < this.testScrol) {
      this.headerWrapper.nativeElement.style.transform = 'translateY(-150%)'
    } else {
    }
    this.testScrol = boundingClientRect.y
  }

  redirectToSight() {
    this.router.navigate(['/sights'])
  }

  changeCity() {
    const coords = this.mapService.getLastMapCoordsFromLocalStorage()
    this.locationService
      .getLocationByCoords(coords)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(EMPTY)),
      )
      .subscribe((response: any) => {
        response?.location?.name ? (this.eventsTapeService.tapeCityName = response.location.name) : null
      })
  }

  searchActiveRender() {
    const children = this.headerTools.nativeElement.children
    const headerToolsSearchElement: HTMLElement = this.headerToolsSearch.nativeElement
    this.searchActive = !this.searchActive

    setTimeout(() => {
      headerToolsSearchElement.className = 'header-tools_search'
      this.headerTools.nativeElement.style.display = 'contents'
    }, 300)
    setTimeout(() => {
      Array.from(children).forEach((child: any) => {
        this.headerClassName = 'header'
        child.style.opacity = '1'
      })
    }, 330)
  }
  searchNoneActiveRender() {
    const children = this.headerTools.nativeElement.children
    const headerToolsSearchElement: HTMLElement = this.headerToolsSearch.nativeElement
    Array.from(children).forEach((child: any) => {
      child.style.opacity = '1'
      child.style.transition = '0.3s all'
      child.style.opacity = '0'
    })
    setTimeout(() => {
      this.headerClassName = 'header_full'
      this.headerTools.nativeElement.style.display = 'none'
      headerToolsSearchElement.className = 'header-tools_search-active'
      this.searchActive = !this.searchActive
    }, 300)
  }
  changeSearch() {
    const children = this.headerTools.nativeElement.children
    const headerToolsSearchElement: HTMLElement = this.headerToolsSearch.nativeElement
    if (!this.searchActive) {
      this.searchNoneActiveRender()
    } else {
      this.searchActiveRender()
    }
  }

  updateCoordinates() {
    return new Promise<void>((resolve) => {
      if (this.filterService.getLocationLatitudeFromlocalStorage()) {
        this.mapService.circleCenterLatitude.next(this.mapService.getLastMapCoordsFromLocalStorage()[0])
        this.mapService.circleCenterLongitude.next(this.mapService.getLastMapCoordsFromLocalStorage()[1])
      } else {
        this.filterService.setLocationLatitudeTolocalStorage('0')
        this.filterService.setLocationLongitudeTolocalStorage('0')
      }

      resolve() // Успешно завершили обновление
    })
  }

  ngAfterViewInit() {}
  ngOnInit() {}
  ionViewWillEnter() {
    this.titleService.setTitle('VOKRUG - Мероприятия вокруг вас')
    this.ionContent.scrollToPoint(0, this.eventsTapeService.eventsLastScrollPositionForTape, 0)
    this.ionContent.ionScroll.pipe(takeUntil(this.destroy$)).subscribe((event: any) => {
      this.eventsTapeService.eventsLastScrollPositionForTape = event.detail.scrollTop
    })
    this.switchTypeService.currentType.value == 'sights' ? this.router.navigate(['/sights']) : null
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      if (value.url === '/event') {
        // this.filterService.changeFilter.next(true)
      }
    })

    this.date = {
      dateStart: this.filterService.startDate.value,
      dateEnd: this.filterService.endDate.value,
    }
    // Подписываемся на изменение фильтра
    if (!this.eventsTapeService.userHaveSubscribedEvents) {
      this.eventsTapeService.eventsLastScrollPositionForTape = 0
      this.ionContent.scrollToPoint(0, this.eventsTapeService.eventsLastScrollPositionForTape, 0)
      this.wait = true
      this.eventsTapeService.notFound = false
      this.filterService.changeFilter.pipe(debounceTime(1000)).subscribe((value) => {
        this.eventsTapeService.eventsCity = []
        this.eventsTapeService.eventsSeparator = []
        this.eventsTapeService.eventsLastScrollPositionForTape = 0
        this.ionContent.scrollToPoint(0, this.eventsTapeService.eventsLastScrollPositionForTape, 0)

        this.eventsTapeService.userHaveSubscribedEvents = true
        this.wait = true
        this.eventsTapeService.nextPage = true
        if (value === true) {
          this.eventsTapeService.notFound = false
          this.queryBuilderService.paginationPublicEventsForTapeCurrentPage.next('')

          this.eventsGeolocation = []
          this.updateCoordinates().then(() => {
            this.getEventsCity()
          })

          this.changeCity()
          // this.getEventsGeolocation()
        }
        this.navigationService.appFirstLoading.next(false) // чтобы удалялся фильтр,
      })
    }

    //Подписываемся на город
    // this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.locationService
    //     .getLocationsIds(value)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe((response: any) => {
    //       this.city = response.location.name
    //     })
    // })
    this.filterService.eventTypes.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.eventTypeId = value[0]
    })
  }
  ionViewDidLeave() {
    this.searchActiveRender()
    this.searchActive = false
    this.destroy$.next()
    this.destroy$.complete()
  }
  setDate(event: any) {
    this.filterService.setStartDateTolocalStorage(event.dateStart.toString())
    this.filterService.setEndDateTolocalStorage(event.dateEnd.toString())
    this.filterService.setLocationLatitudeTolocalStorage(this.mapService.circleCenterLatitude.value.toString())
    this.filterService.setLocationLongitudeTolocalStorage(this.mapService.circleCenterLongitude.value.toString())
    // this.queryBuilderService.updateParams()
    this.filterService.changeFilter.next(true)
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
