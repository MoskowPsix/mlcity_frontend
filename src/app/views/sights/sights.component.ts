import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
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
} from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { ISight } from 'src/app/models/sight'
import { ToastService } from 'src/app/services/toast.service'
import { FilterService } from 'src/app/services/filter.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { NavigationService } from 'src/app/services/navigation.service'
import { SightsService } from 'src/app/services/sights.service'
import { LocationService } from 'src/app/services/location.service'
import { Metrika } from 'ng-yandex-metrika'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'

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

    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private metrika: Metrika,
    private router: Router,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
  ) {
    this.filterService.locationId
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.locationService
          .getLocationsIds(value)
          .pipe(delay(100), retry(3), takeUntil(this.destroy$))
          .subscribe((response) => {
            this.titleService.setTitle(
              'Достопримечательности в городе ' + response.location.name,
            )

            this.metaService.updateTag({
              name: 'description',
              content: 'Достопримечательности вашего города тут',
            })
          })
      })

    let prevPath = this.location.path()
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const newPath = location.path()
        this.metrika.hit(newPath, {
          referer: prevPath,
          callback: () => {},
        })
        prevPath = newPath
      })
  }

  scrollUp() {
    console.log('я работаю')
    document.getElementById('topSi')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  getSightsCity() {
    this.loadingMoreSightsCity
      ? (this.loadingSightsCity = true)
      : (this.loadingSightsCity = false)

    this.sightsService
      .getSights(this.queryBuilderService.queryBuilder('sightsForTape'))
      .pipe(
        delay(100),
        retry(3),
        map((respons: any) => {
          this.sightsCity.push(...respons.sights.data)
          this.filterService.setSightsCount(respons.total)
          this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next(
            respons.sights.next_cursor,
          )
          respons.sights.next_cursor
            ? (this.nextPage = true)
            : (this.nextPage = false)
          respons.sights.next_cursor
            ? (this.loadTrue = true)
            : (this.loadTrue = false)
        }),
        tap(() => {
          this.loadingSightsCity = true
          this.loadingMoreSightsCity = false
        }),
        catchError((err) => {
          this.toastService.showToast(MessagesErrors.default, 'danger')
          this.loadingSightsCity = false
          return of(EMPTY)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  // getSightsGeolocation(){
  //   this.loadingMoreSightsGeolocation ? this.loadingSightsGeolocation = true : this.loadingSightsGeolocation = false

  //   this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsPublicForGeolocationTab')).pipe(
  //     delay(100),
  //     retry(3),
  //     map((respons:any) => {
  //       this.sightsGeolocation.push(...respons.sights.data)
  //       this.totalPagesSightsGeolocation = respons.sights.last_page
  //       //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
  //     }),
  //     tap(() => {
  //       this.loadingSightsGeolocation = true
  //       this.loadingMoreSightsGeolocation = false
  //     }),
  //     catchError((err) =>{
  //       this.toastService.showToast(MessagesErrors.default, 'danger')
  //       this.loadingSightsGeolocation = false
  //       return of(EMPTY)
  //     }),
  //     takeUntil(this.destroy$)
  //   ).subscribe()
  // }

  sightsCityLoadingMore() {
    this.loadingMoreSightsCity = true
    this.currentPageSightsCity++
    // this.queryBuilderService.paginationPublicSightsCityCurrentPage.next(this.currentPageSightsCity)
    this.getSightsCity()
  }

  // sightsGeolocationLoadingMore(){
  //   this.loadingMoreSightsGeolocation = true
  //   this.currentPageSightsGeolocation++
  //   this.queryBuilderService.paginationPublicSightsGeolocationCurrentPage.next(this.currentPageSightsGeolocation)
  //   this.getSightsGeolocation()
  // }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value
  }

  scrollUpCheckState() {
    const boundingClientRect =
      this.ContentCol?.nativeElement.getBoundingClientRect()
    boundingClientRect
      ? (this.scrollUpState = boundingClientRect.y > 0)
      : (this.scrollUpState = false)
  }

  scrollEvent = (): void => {
    this.scrollUpCheckState()

    let viewElement: boolean = false

    for (
      let i = 0;
      i < this.widgetsContent.nativeElement.children.length;
      i++
    ) {
      const boundingClientRect =
        this.widgetsContent.nativeElement.children[i].getBoundingClientRect()

      if (
        boundingClientRect.top >
          (window.innerHeight - (window.innerHeight + window.innerHeight)) /
            2 &&
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

  ngOnInit() {
    // this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.locationService.getLocationsIds(value).pipe(
    //     delay(100),
    //     retry(3),
    //     takeUntil(this.destroy$)
    //     ).subscribe((response) => {
    //       console.log(response)
    //       this.titleService.setTitle("Мероприятия в " + response.location.name)
    //     })
    // })
    window.addEventListener('scroll', this.scrollPaginate, true)
    window.addEventListener('scrollend', this.scrollEvent, true)
    this.sightsCity = []
    this.sightsGeolocation = []
    this.getSightsCity()
    // this.getSightsGeolocation()

    //Подписываемся на изменение фильтра
    this.filterService.changeFilter
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value === true) {
          this.sightsCity = []
          this.sightsGeolocation = []
          this.getSightsCity()
          // this.getSightsGeolocation()
        }
        this.navigationService.appFirstLoading.next(false) // чтобы удалялся фильтр,
      })

    //Подписываемся на город
    // this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.locationService.getLocationsIds(value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
    //     this.city = response.location.name
    //   })
    // })
    this.filterService.sightTypes
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.sightTypeId = value[0]
      })
  }

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
    const boundingClientRect =
      this.ContentCol.nativeElement?.getBoundingClientRect()

    if (this.testScrol == 0) {
      this.testScrol = boundingClientRect.y
      this.headerWrapper.nativeElement.style.transform = 'translateY(-0%)'
    }
    if (boundingClientRect.y > this.testScrol) {
      this.headerWrapper.nativeElement.style.transform = 'translateY(-0%)'
      console.log('ScrollUp')
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

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.queryBuilderService.paginationPublicSightsForTapeCurrentPage.next('')
    this.destroy$.complete()
  }
}
