import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  Output,
  Input,
} from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import {
  Subject,
  takeUntil,
  tap,
  retry,
  catchError,
  of,
  EMPTY,
  map,
  delay,
  filter,
  timeInterval,
} from 'rxjs'
import { EventsService } from 'src/app/services/events.service'
import { IonicSlides } from '@ionic/angular'
import { register } from 'swiper/element/bundle'
import { environment } from 'src/environments/environment'
import { MessagesAuth } from 'src/app/enums/messages-auth'
import { ToastService } from 'src/app/services/toast.service'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { AuthService } from 'src/app/services/auth.service'
import { DomSanitizer } from '@angular/platform-browser'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { Location } from '@angular/common'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'
import { UserService } from 'src/app/services/user.service'
import { FilterService } from 'src/app/services/filter.service'
import { LocationService } from 'src/app/services/location.service'
import { MapService } from 'src/app/services/map.service'
import { YaReadyEvent } from 'angular8-yandex-maps'

// import { Swiper } from 'swiper/types';

register()
@Component({
  selector: 'app-event-show',
  templateUrl: './event-show.component.html',
  styleUrls: ['./event-show.component.scss'],
})
export class EventShowComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  swiperModules = [IonicSlides]

  userAuth: boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT


  user?: any
  eventId?: number
  event?: any
  places: any[] = []
  loadingEvent: boolean = true
  loadPlace: boolean = false
  loadMore: boolean = true

  favorite: boolean = false
  loadingFavotire: boolean = false

  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0

  locationId!: number
  map!: YaReadyEvent<ymaps.Map>

  showRout: boolean = false
  url: any = ''
  @Input() createObj: any = {}
  constructor(
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private queryBuilderService: QueryBuilderService,
    public router: Router,
    private titleService: Title,
    private metaService: Meta,
    private filterService: FilterService,
    private locationService: LocationService,
    private mapService: MapService,
  ) {
  }

  getEvent() {
    this.eventsService
      .getEventById(this.eventId!)
      .pipe(
        retry(3),
        tap(() => (this.loadingEvent = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((event: any) => {
        if (event) {
          this.event = event
          // this.places = event.places_full;
        }
        this.titleService.setTitle(event.name)
        this.metaService.updateTag({
          name: 'description',
          content: event.description,
        })
        this.startLikesCount = this.event?.likes
          ? this.event.likes.vk_count + this.event.likes.local_count
          : 0
      })
  }

  setLocationForPlaces() {
    this.loadPlace = true
    const coords = this.mapService.getLastMapCoordsFromLocalStorage()
    this.locationService
      .getLocationByCoords(coords)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.log(err)
          return of(EMPTY)
        }),
      )
      .subscribe(async (response: any) => {
        await this.queryBuilderService.locationIdForEventShow.next(
          response.location.id,
        )
        await this.getEventPlaces()
      })
  }

  getEventPlaces() {
    if (this.loadMore) {
      this.loadPlace = true
      this.eventsService
        .getEventPlaces(
          this.eventId,
          this.queryBuilderService.queryBuilder('eventPlaces'),
        )
        .pipe(
          delay(100),
          retry(3),
          tap(() => (this.loadPlace = false)),
          catchError((error) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe((response: any) => {
          this.places.push(...response.places.data)
          this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next(
            response.places.next_cursor,
          )
          response.places.next_cursor
            ? (this.loadMore = true)
            : (this.loadMore = false)
          this.cdr.detectChanges()
        })
    }
  }

  onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>, place: any) {
    //Создаем метку
    this.map = { target, ymaps }
    target.geoObjects.add(
      new ymaps.Placemark(
        [place.controls.coords.value[0], place.controls.coords.value[1]],
        {},
        { preset: 'twirl#violetIcon' },
      ),
    )
    this.map.target.controls.remove('zoomControl')
    this.map.target.behaviors.disable('drag')
  }

  setActivePlace(i: number) {
    this.places[i].active = true
  }

  getMinPrice(prices: any[]) {
    let sort_prices = prices.sort((a, b) => a.cost_rub - b.cost_rub)
    return sort_prices[0].cost_rub
  }

  getMaxPrice(prices: any[]) {
    let sort_prices = prices.sort((a, b) => a.cost_rub - b.cost_rub)
    return sort_prices[sort_prices.length - 1].cost_rub
  }

  getUrlFrame(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  checkLiked() {
    if (this.userAuth)
      this.eventsService
        .checkLiked(this.eventId!)
        .pipe(retry(3), takeUntil(this.destroy$))
        .subscribe((liked: boolean) => {
          this.like = liked
        })
  }

  checFavorite() {
    if (this.userAuth)
      this.eventsService
        .checkFavorite(this.eventId!)
        .pipe(retry(3), takeUntil(this.destroy$))
        .subscribe((favorite: boolean) => {
          this.favorite = favorite
        })
  }

  // onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): void {
  //   let icoLink = this.event && this.event.types && this.event.types.length ? this.host + ':' + this.port + this.event.types[0].ico : ''

  //   //Создаем метку
  //   target.geoObjects.add(
  //     new ymaps.Placemark([this.event?.latitude,this.event?.longitude],{}, {
  //       iconLayout: 'default#imageWithContent',
  //       iconContentLayout: ymaps.templateLayoutFactory.createClass(`'<div class="marker"><img src="${icoLink}"/></div>'`)
  //     })
  //   )
  // }

  toggleFavorite(event_id: number) {
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      this.loadingFavotire = true // для отображения спинера
      this.eventsService
        .toggleFavorite(event_id)
        .pipe(
          tap(() => {
            this.favorite = !this.favorite
            this.loadingFavotire = false
          }),
          catchError((err) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe()
    }
  }

  toggleLike(event_id: number) {
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      this.loadingLike = true // для отображения спинера
      this.eventsService
        .toggleLike(event_id)
        .pipe(
          tap(() => {
            this.like = !this.like
            this.like
              ? this.startLikesCount++
              : this.startLikesCount !== 0
                ? this.startLikesCount--
                : 0
            this.loadingLike = false
          }),
          catchError((err) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe()
    }
  }

  ngOnInit() {
    //Получаем ид ивента из параметра маршрута
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.eventId = params['id']
    })
    this.userAuth = this.authService.getAuthState()
    if (this.router.url !== '/cabinet/events/create') {
      this.getEvent()
      this.checkLiked()
      this.checFavorite()
      this.filterService.locationId
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.loadMore = true
          this.locationId = Number(value)
          this.places = []
          this.setLocationForPlaces()
        })
      this.router.events
        .pipe(takeUntil(this.destroy$))
        .subscribe((value: any) => {
          this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next(
            '',
          )
        })
    }
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
