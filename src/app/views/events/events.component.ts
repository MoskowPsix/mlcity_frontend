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

import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, debounceTime, filter, last } from 'rxjs'
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
  wait: boolean = true
  scrollStart: any
  switchTypeService: SwitchTypeService = inject(SwitchTypeService)

  @ViewChild('cardContainer')
  cardContainer!: ElementRef
  @ViewChild('widgetsContent') widgetsContent!: ElementRef
  @ViewChild('lentEvent') lent!: ElementRef

  loadingEventsCity: boolean = false
  loadingEventsGeolocation: boolean = false

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
  ) {
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.locationService
        .getLocationsIds(value)
        .pipe(delay(100), retry(3), takeUntil(this.destroy$))
        .subscribe((response) => {
          this.titleService.setTitle('Мероприятия в городе ' + response.location.name)
          this.metaService.updateTag({
            name: 'description',
            content: 'Мероприятия вашего города тут',
          })
        })
    })
  }

  scrollUp() {
    document.getElementById('topEv')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  openCitySearch() {
    this.navigationService.modalSearchCityesOpen.next(true)
  }

  eventNavigation(event: any) {
    this.router.navigate(['/events', event])
  }

  scrollUpCheckState() {
    const boundingClientRect = this.ContentCol?.nativeElement.getBoundingClientRect()
    boundingClientRect ? (this.scrollUpState = boundingClientRect.y > 0) : (this.scrollUpState = false)
  }

  // getEventsCity() {
  //   if (this.wait) {
  //     this.wait = false
  //     if (this.eventsTapeService.nextPage) {
  //       this.spiner = true
  //       this.eventsService
  //         .getEvents(this.queryBuilderService.queryBuilder('eventsForTape'))
  //         .pipe(
  //           tap((response: any) => {
  //             this.eventsTapeService.eventsCity.push(...response.events.data)
  //           }),
  //           tap((response: any) => {
  //             response.events.next_cursor
  //               ? this.queryBuilderService.paginationPublicEventsForTapeCurrentPage.next(response.events.next_cursor)
  //               : (this.eventsTapeService.nextPage = false)
  //           }),
  //           tap((response: any) => {
  //             if (response.events.next_cursor) {
  //               this.eventsTapeService.nextPage = true
  //               this.spiner = false
  //             } else {
  //               this.eventsTapeService.nextPage = false
  //               this.spiner = false
  //             }
  //           }),
  //           catchError((err) => {
  //             this.toastService.showToast(MessagesErrors.default, 'danger')
  //             this.loadingEventsCity = false
  //             return of(EMPTY)
  //           }),
  //           takeUntil(this.destroy$),
  //         )
  //         .subscribe((response: any) => {
  //           if (this.eventsTapeService.eventsCity.length === 0) {
  //             this.notFound = true
  //           }
  //           this.wait = true
  //           this.spiner = false
  //         })
  //     } else {
  //       this.spiner = false
  //     }
  //   }
  // }

  getEventsCity() {
    if (this.eventsTapeService.nextPage && !this.eventsTapeService.wait) {
      this.eventsTapeService.wait = true
      //Спинер если запрос не первый
      if (this.eventsTapeService.eventsCity.length > 0) {
        this.spiner = true
      }
      
      this.eventsService
        .getEvents(this.queryBuilderService.queryBuilder('eventsForTape'))
        .pipe(debounceTime(1000))
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
          this.eventsTapeService.eventsCity.push(...response.events.data)
          if (this.eventsTapeService.eventsCity.length === 0) {
            this.notFound = true
          }
          this.eventsTapeService.wait = false
        })
    }
  }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value
  }

  scrollEvent = (): void => {
    // this.scrollUpCheckState()
    // let viewElement: boolean = false
    // for (let i = 0; i < this.widgetsContent.nativeElement.children.length; i++) {
    //   const boundingClientRect = this.widgetsContent.nativeElement.children[i].getBoundingClientRect()
    //   if (
    //     boundingClientRect.top > (window.innerHeight - (window.innerHeight + window.innerHeight)) / 2 &&
    //     boundingClientRect.top < window.innerHeight / 2 &&
    //     !viewElement &&
    //     boundingClientRect.width !== 0 &&
    //     boundingClientRect.width !== 0
    //   ) {
    //     this.viewId.push(this.widgetsContent.nativeElement.children[i].id)
    //     if (this.timeStart == 0) {
    //       this.timeStart = new Date().getTime()
    //     } else {
    //       let time = (new Date().getTime() - this.timeStart) / 1000
    //       if (time >= 3.14) {
    //         let id = this.viewId[this.viewId.length - 2]
    //         this.eventsService
    //           .addView(id, time)
    //           .pipe(
    //             delay(100),
    //             retry(1),
    //             catchError((err) => {
    //               return of(EMPTY)
    //             }),
    //             takeUntil(this.destroy$),
    //           )
    //           .subscribe()
    //       }
    //       this.timeStart = 0
    //       this.timerReload()
    //     }
    //   }
    // }
    // viewElement = true
  }

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

  ngAfterViewInit() {}
  ngOnInit() {}
  ionViewWillEnter() {
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
      this.notFound = false
      this.filterService.changeFilter.pipe(debounceTime(1000)).subscribe((value) => {
        this.eventsTapeService.eventsCity = []
        this.eventsTapeService.eventsLastScrollPositionForTape = 0
        this.ionContent.scrollToPoint(0, this.eventsTapeService.eventsLastScrollPositionForTape, 0)

        this.eventsTapeService.userHaveSubscribedEvents = true
        this.wait = true
        this.eventsTapeService.nextPage = true
        if (value === true) {
          this.notFound = false
          this.queryBuilderService.paginationPublicEventsForTapeCurrentPage.next('')

          this.eventsGeolocation = []

          this.getEventsCity()
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
