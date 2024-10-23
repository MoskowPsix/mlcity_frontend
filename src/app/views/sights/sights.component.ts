import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, debounceTime, filter } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { ISight } from 'src/app/models/sight'
import { ToastService } from 'src/app/services/toast.service'
import { FilterService } from 'src/app/services/filter.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { NavigationService } from 'src/app/services/navigation.service'
import { SightsService } from 'src/app/services/sights.service'
import { LocationService } from 'src/app/services/location.service'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'
import { OrganizationService } from 'src/app/services/organization.service'
import { MapService } from 'src/app/services/map.service'
import { SightTapeService } from 'src/app/services/sight-tape.service'
import { IonContent } from '@ionic/angular'
import { error } from 'console'

@Component({
  selector: 'app-sights',
  templateUrl: './sights.component.html',
  styleUrls: ['./sights.component.scss'],
})
export class SightsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  @ViewChild('ContentCol') ContentCol!: ElementRef

  city: string = ''
  segment: string = 'sightsCitySegment'

  sightsGeolocation: ISight[] = []
  spiner: boolean = false
  notFound: boolean = false
  loadingSightsCity: boolean = false
  loadingSightsGeolocation: boolean = false

  loadingMoreSightsCity: boolean = false
  loadingMoreSightsGeolocation: boolean = false

  currentPageSightsCity: number = 1
  currentPageSightsGeolocation: number = 1

  cardContainer!: ElementRef
  @ViewChild('widgetsContent') widgetsContent!: ElementRef
  @ViewChild('headerWrapper') headerWrapper!: ElementRef
  @ViewChild(IonContent) ionContent!: IonContent
  viewId: number[] = []
  timeStart: number = 0

  loadTrue: boolean = false

  sightTypeId: any

  scrollUpState: boolean = true
  testScrol: any = 0
  constructor(
    private sightsService: SightsService,
    private toastService: ToastService,
    private organizationService: OrganizationService,
    public sightTapeService: SightTapeService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private mapService: MapService,
  ) {
    // this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.locationService
    //     .getLocationsIds(value)
    //     .pipe(delay(100), retry(3), takeUntil(this.destroy$))
    //     .subscribe((response) => {
    //       this.titleService.setTitle('Достопримечательности в городе ' + response.location.name)
    //       this.metaService.updateTag({
    //         name: 'description',
    //         content: 'Достопримечательности вашего города тут',
    //       })
    //     })
    // })
  }
  organizationNavigation(event: any) {
    this.router.navigate(['/organizations', event])
  }
  scrollUp() {
    document.getElementById('topSi')?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  redirectToEvent() {
    this.router.navigate(['/events'])
  }

  openCitySearch() {
    this.navigationService.modalSearchCityesOpen.next(true)
  }

  // getSightsCity() {
  //   // this.loadingMoreSightsCity ? (this.loadingSightsCity = true) : (this.loadingSightsCity = false)
  //   this.sightTapeService.sightsCity.length > 0 ? (this.spiner = true) : (this.spiner = false) //проверяем что запрос не первый
  //   this.notFound = false
  //   if (this.sightTapeService.nextPage) {
  //     this.sightsService
  //       .getSights(this.queryBuilderService.queryBuilder('sightsForTape'))
  //       .pipe(
  //         delay(100),
  //         retry(3),

  //         tap((response: any) => {
  //           this.sightTapeService.sightsCity.push(...response.sights.data)
  //           this.loadingSightsCity = true
  //           this.loadingMoreSightsCity = false
  //           if (this.sightTapeService.nextPage == null) {
  //             this.spiner = false
  //           } else {
  //             this.spiner = false
  //           }
  //         }),
  //         tap((response: any) => {
  //           response.sights.next_cursor
  //             ? this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next(response.sights.next_cursor)
  //             : (this.sightTapeService.nextPage = false)
  //           response.sights.next_cursor ? (this.loadTrue = true) : (this.loadTrue = false)
  //         }),
  //         tap((response: any) => {
  //           if (this.sightTapeService.sightsCity.length == 0) {
  //             this.notFound = true
  //           }
  //           this.filterService.setSightsCount(response.total)
  //         }),

  //         catchError((err) => {
  //           console.log(err)
  //           this.toastService.showToast(MessagesErrors.default, 'danger')
  //           this.loadingSightsCity = false
  //           return of(EMPTY)
  //         }),
  //         takeUntil(this.destroy$),
  //       )
  //       .subscribe(() => {
  //         if (this.sightTapeService.sightsCity.length === 0) {
  //           this.notFound = true
  //         }
  //       })
  //   } else {
  //     this.spiner = false
  //   }
  // }
  getSightsCity() {
    if (this.sightTapeService.nextPage && !this.sightTapeService.wait) {
      this.sightTapeService.wait = true
      if (this.sightTapeService.sightsCity.length > 0) {
        this.spiner = true
      }
      this.sightsService
        .getSights(this.queryBuilderService.queryBuilder('sightsForTape'))
        .pipe(
          debounceTime(1000),
          takeUntil(this.destroy$),
          catchError((error) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            console.error(error)
            return EMPTY
          }),
        )
        .subscribe((response: any) => {
          this.spiner = false
          //Проверяем курсор
          let cursor = response.sights.next_cursor
          if (cursor) {
            this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next(cursor)
            this.sightTapeService.nextPage = true
          } else {
            this.sightTapeService.nextPage = false
          }
          this.sightTapeService.sightsCity.push(...response.sights.data)
          if (this.sightTapeService.sightsCity.length === 0) {
            this.notFound = true
          }
          this.sightTapeService.wait = false
        })
    }
  }

  sightsCityLoadingMore() {}

  onSegmentChanged(event: any) {
    this.segment = event.detail.value
  }

  scrollUpCheckState() {
    const boundingClientRect = this.ContentCol?.nativeElement.getBoundingClientRect()
    boundingClientRect ? (this.scrollUpState = boundingClientRect.y > 0) : (this.scrollUpState = false)
  }

  scrollEvent = (): void => {
    this.scrollUpCheckState()

    let viewElement: boolean = false

    for (let i = 0; i < this.widgetsContent.nativeElement.children.length; i++) {
      const boundingClientRect = this.widgetsContent.nativeElement.children[i].getBoundingClientRect()

      if (
        boundingClientRect.top > (window.innerHeight - (window.innerHeight + window.innerHeight)) / 2 &&
        boundingClientRect.top < window.innerHeight / 2 &&
        !viewElement &&
        boundingClientRect.width !== 0 &&
        boundingClientRect.width !== 0
      ) {
        this.viewId.push(this.widgetsContent.nativeElement.children[i].id)

        if (this.timeStart == 0) {
          this.timeStart = new Date().getTime()
        } else {
          let time = (new Date().getTime() - this.timeStart) / 1000

          if (time >= 3.14) {
            let id = this.viewId[this.viewId.length - 2]
            this.sightsService
              .addView(id, time)
              .pipe(
                delay(100),
                retry(1),
                catchError((err) => {
                  return of(EMPTY)
                }),
                takeUntil(this.destroy$),
              )
              .subscribe()
          }

          this.timeStart = 0

          this.timerReload()
        }
      }
    }
    viewElement = true
  }

  timerReload() {
    this.timeStart = new Date().getTime()
  }

  ngOnInit() {}

  sightTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setSightTypesTolocalStorage([typeId])
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setSightTypesTolocalStorage([])
      this.filterService.changeFilter.next(true)
    }
  }

  scrollPaginate = (): void => {
    const boundingClientRect = this.ContentCol.nativeElement?.getBoundingClientRect()

    if (this.testScrol == 0) {
      this.testScrol = boundingClientRect.y
      this.headerWrapper.nativeElement.style.transform = 'translateY(-0%)'
    }
    if (boundingClientRect.y > this.testScrol) {
      this.headerWrapper.nativeElement.style.transform = 'translateY(-0%)'
    }
    if (boundingClientRect.y < this.testScrol) {
      this.headerWrapper.nativeElement.style.transform = 'translateY(-220%)'
    } else {
    }
    this.testScrol = boundingClientRect.y
    // console.log(this.ContentCol.nativeElement.getBoundingClientRect().bottom, window.innerHeight)
    if (
      boundingClientRect.bottom <= window.innerHeight * 2 &&
      !(boundingClientRect.bottom <= window.innerHeight) &&
      this.sightTapeService.sightsCity &&
      this.loadTrue
    ) {
      this.loadTrue = false
      this.sightsCityLoadingMore()
    }
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
        response?.location?.name ? (this.sightTapeService.tapeCityName = response.location.name) : null
      })
  }

  ionViewWillEnter() {
    this.titleService.setTitle('VOKRUG - Сообщества вокруг вас')
    window.addEventListener('scroll', this.scrollPaginate, true)
    window.addEventListener('scrollend', this.scrollEvent, true)
    this.ionContent.scrollToPoint(0, this.sightTapeService.eventsLastScrollPositionForTape, 0)
    this.ionContent.ionScroll.pipe(takeUntil(this.destroy$)).subscribe((event: any) => {
      this.sightTapeService.eventsLastScrollPositionForTape = event.detail.scrollTop
    })
    if (!this.sightTapeService.userHaveSubscribedEvents) {
      //Подписываемся на изменение фильтра
      this.filterService.changeFilter.pipe(debounceTime(1000)).subscribe((value) => {
        this.sightTapeService.eventsLastScrollPositionForTape = 0
        this.ionContent.scrollToPoint(0, this.sightTapeService.eventsLastScrollPositionForTape, 0)
        this.sightTapeService.sightsCity = []
        if (value === true) {
          this.sightTapeService.sightsCity = []
          this.sightsGeolocation = []
          this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next('')
          this.sightTapeService.nextPage = true
          this.notFound = false
          this.sightTapeService.userHaveSubscribedEvents = true
          this.getSightsCity()
          this.changeCity()
        }
        this.navigationService.appFirstLoading.next(false) // чтобы удалялся фильтр,
      })
      this.filterService.sightTypes.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
        this.sightTypeId = value[0]
      })
    }
  }
  ionViewDidLeave() {
    this.destroy$.next()
    this.destroy$.complete()
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
