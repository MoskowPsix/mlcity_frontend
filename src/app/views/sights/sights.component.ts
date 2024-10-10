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

  sightsCity: ISight[] = []
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
  viewId: number[] = []
  timeStart: number = 0

  nextPage: boolean = false
  loadTrue: boolean = false

  sightTypeId: any

  scrollUpState: boolean = true
  testScrol: any = 0
  constructor(
    private sightsService: SightsService,
    private toastService: ToastService,
    private organizationService: OrganizationService,

    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private mapService: MapService,
  ) {
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.locationService
        .getLocationsIds(value)
        .pipe(delay(100), retry(3), takeUntil(this.destroy$))
        .subscribe((response) => {
          this.titleService.setTitle('Достопримечательности в городе ' + response.location.name)

          this.metaService.updateTag({
            name: 'description',
            content: 'Достопримечательности вашего города тут',
          })
        })
    })
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

  getSightsCity() {
    // this.loadingMoreSightsCity ? (this.loadingSightsCity = true) : (this.loadingSightsCity = false)
    this.sightsCity.length > 0 ? (this.spiner = true) : (this.spiner = false) //проверяем что запрос не первый
    this.notFound = false
    if (this.nextPage) {
      this.sightsService
        .getSights(this.queryBuilderService.queryBuilder('sightsForTape'))
        .pipe(
          delay(100),
          retry(3),
          map((response: any) => {
            this.sightsCity.push(...response.sights.data)
            if (this.sightsCity.length == 0) {
              this.notFound = true
            }
            this.filterService.setSightsCount(response.total)
            this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next(response.sights.next_cursor)
            response.sights.next_cursor ? (this.nextPage = true) : (this.nextPage = false)
            response.sights.next_cursor ? (this.loadTrue = true) : (this.loadTrue = false)
          }),
          tap((response: any) => {
            this.loadingSightsCity = true
            this.loadingMoreSightsCity = false
            if (this.nextPage == null) {
              this.spiner = false
            } else {
              this.spiner = false
            }
          }),
          catchError((err) => {
            console.log(err)
            this.toastService.showToast(MessagesErrors.default, 'danger')
            this.loadingSightsCity = false
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(() => {
          if (this.sightsCity.length === 0) {
            this.notFound = true
          }
        })
    } else {
      this.spiner = false
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
      this.sightsCity &&
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
        response?.location?.name ? (this.city = response.location.name) : null
      })
  }

  ionViewWillEnter() {
    window.addEventListener('scroll', this.scrollPaginate, true)
    window.addEventListener('scrollend', this.scrollEvent, true)
    this.sightsCity = []
    this.sightsGeolocation = []
    this.nextPage = true
    this.notFound = false
    //Подписываемся на изменение фильтра
    this.filterService.changeFilter.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe((value) => {
      if (value === true) {
        this.sightsCity = []
        this.sightsGeolocation = []
        this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next('')
        this.nextPage = true
        this.notFound = false
        this.getSightsCity()
        this.changeCity()
      }
      this.navigationService.appFirstLoading.next(false) // чтобы удалялся фильтр,
    })
    this.filterService.sightTypes.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.sightTypeId = value[0]
    })
  }
  ionViewDidLeave() {
    this.destroy$.next()
    this.destroy$.complete()
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next('')
    this.destroy$.complete()
  }
}
