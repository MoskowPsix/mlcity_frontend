import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, Output, Input, inject } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { Subject, takeUntil, tap, retry, catchError, of, EMPTY, map, delay, filter, timeInterval, finalize } from 'rxjs'
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
import { SliderComponent } from '@angular-slider/ngx-slider/slider.component'
import { SearchFirstySeanceService } from 'src/app/services/search-firsty-seance.service'
import { ISight } from 'src/app/models/sight'
import { IOrganization } from 'src/app/models/organization'
import { IEvent } from 'src/app/models/event'
import { TextFormatService } from 'src/app/services/text-format.service'
import { Share } from '@capacitor/share'
import { ShareService } from 'src/app/services/share.service'
import { ViewsService } from 'src/app/services/views.service'
import { NumbersService } from 'src/app/services/numbers.service'
import { IUser } from 'src/app/models/user'
import { FavoritesTapeService } from '../../cabinet/favorites/favorites-tape.service'
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
  openImagesModal: boolean = false
  places: any[] = []
  loadingEvent: boolean = true
  loadPlace: boolean = false
  loadMore: boolean = true
  nextPageFavoritesUser: boolean = true
  nextPageSpiner: boolean = false
  usersCount: string = '0'

  favorite: boolean = false
  favoriteCheked: boolean = false
  usersInFavorite: IUser[] = []

  loadingFavotire: boolean = false
  firstySeance: any
  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0
  oldTypes: number[] = []
  openUserModalValue: boolean = false
  ageLimit: string = ''

  textFormat: TextFormatService = inject(TextFormatService)

  wait: boolean = true
  nextPage: boolean = true
  spiner: boolean = false
  eventsCity: any = []

  locationId!: number
  map!: YaReadyEvent<ymaps.Map>

  showRout: boolean = false
  searchFirstySeanceService: SearchFirstySeanceService = inject(SearchFirstySeanceService)
  url: any = ''
  likeUrl: string = 'assets/icons/like.svg'
  favoriteUrl: string = ''
  priceState: string = ''
  priceStateForShow: string = ''
  materialLink: string = ''
  usersViews: string = ''
  @Input() createObj: any = {}
  organization!: IOrganization

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
    private favoritesTapeService: FavoritesTapeService,
    private viewsService: ViewsService,
    private metaService: Meta,
    private filterService: FilterService,
    private locationService: LocationService,
    private mapService: MapService,
    private shareService: ShareService,
    private numbersService: NumbersService,
  ) {}

  checkMaterialLink() {
    if (this.event.afisha7_id) {
      this.materialLink = 'Источник: afisha7.ru'
    } else if (this.event.min_cult_id) {
      this.materialLink = 'Источник: mincult'
    } else if (this.event.cult_id) {
      this.materialLink = 'Источник: culture.ru'
    } else {
      this.materialLink = `Источник: ${this.organization.name}`
    }
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
          this.event = event.event
          this.setUsersCount()
          this.setUserViews()
          this.checkPrice()
          if (this.event.age_limit) {
            this.ageLimit = this.event.age_limit.split('+')[0]
          }

          // this.places = event.places_full;
        }
        this.titleService.setTitle(event.name)

        this.metaService.updateTag({
          name: 'description',
          content: event.description,
        })
        this.startLikesCount = this.event?.likes ? this.event.likes.vk_count + this.event.likes.local_count : 0
        this.eventsService
          .getOrganization(this.event.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((response: any) => {
            this.organization = response.organization
            this.checkMaterialLink()
          })
        this.getEventsCity()
      })
  }

  async shareContent() {
    this.shareService.shareNowUrl()
  }
  goToOrganization(event: any) {
    this.router.navigate(['/organizations', this.organization.id])
  }

  setUsersCount() {
    this.usersCount = this.numbersService.changeDischarge(Number(this.event.favoritesUsers))
  }
  setUserViews() {
    this.usersViews = this.numbersService.changeDischarge(Number(this.event.views.count))
  }

  openStateUsersModal() {
    this.openUserModalValue = true
  }
  closeStateUsersModal() {
    this.openUserModalValue = false
  }
  clearTempUsersFavorites() {
    this.nextPageFavoritesUser = true
    this.nextPageSpiner = false
    this.usersInFavorite = []
  }
  getFavoritesUsers() {
    if (this.nextPageFavoritesUser) {
      if (this.usersInFavorite.length > 1) {
        this.nextPageSpiner = true
      }
      this.eventsService
        .getLikedUsersById(String(this.eventId))
        .pipe(
          finalize(() => {
            this.nextPageSpiner = false
          }),
        )
        .subscribe((res: any) => {
          this.usersInFavorite.push(...res.events.data)

          if (res.next_cursor) {
            this.queryBuilderService.paginationUsersFavoritesCurrentPage.next(res.next_cursor)
            this.nextPageFavoritesUser = true
          } else {
            this.nextPageFavoritesUser = false
          }
        })
    }
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
        if (response.location) {
          await this.queryBuilderService.locationIdForEventShow.next(response.location.id)
          await this.getEventPlaces()
        }
      })
  }
  eventNavigation(event: any) {
    this.router.navigate(['/events', event])
  }

  getEventPlaces() {
    if (this.loadMore) {
      this.loadPlace = true
      this.eventsService
        .getEventPlaces(this.eventId)
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
          this.searchFirstySeanceService.searchSeance(this.places).then((res) => {
            this.firstySeance = res
          })
          this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next(response.places.next_cursor)
          response.places.next_cursor ? (this.loadMore = true) : (this.loadMore = false)
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

  getEventsCity() {
    if (this.wait && this.event) {
      this.wait = false
      if (this.nextPage) {
        this.spiner = true

        let newTypes: any = []
        this.event.types.forEach((type: any) => {
          newTypes.push(type.id)
        })

        this.queryBuilderService.eventTypesRecomend = newTypes.join(',')
        this.eventsService
          .getEvents(this.queryBuilderService.queryBuilder('eventsForRecomend'))
          .pipe(
            tap((response: any) => {
              response.events.data.forEach((element: IEvent) => {
                element.id !== this.event.id ? this.eventsCity.push(element) : null
              })
              if (response.events.next_cursor == null) {
                this.nextPage = false
                this.spiner = false
              } else {
                this.nextPage = true
                this.spiner = false
              }
            }),
            catchError((err) => {
              this.toastService.showToast(MessagesErrors.default, 'danger')

              return of(EMPTY)
            }),
            takeUntil(this.destroy$),
          )
          .subscribe((response: any) => {
            if (this.eventsCity.length === 0) {
            }
            this.wait = true
            this.spiner = false
          })
      } else {
        this.spiner = false
      }
    }
  }

  checkFavorite() {
    this.clearTempUsersFavorites()
    this.getFavoritesUsers()
    if (this.userAuth) {
      this.eventsService
        .checkFavorite(this.eventId!)
        .pipe(retry(3), takeUntil(this.destroy$))
        .subscribe((favorite: any) => {
          this.favoriteCheked = true
          this.favorite = favorite.is_favorite
          if (this.favorite === true) {
            this.likeUrl = 'assets/icons/like-active.svg'
          } else {
            this.likeUrl = 'assets/icons/like.svg'
          }
        })
    } else {
      this.favoriteCheked = true
      if (this.favoritesTapeService.events.find((item: any) => item.id == this.eventId)) {
        this.favorite = true
        this.favoriteCheked = true
        this.likeUrl = 'assets/icons/like-active.svg'
      } else {
        this.likeUrl = 'assets/icons/like.svg'
        this.favorite = false
      }
    }
  }
  closeImagesModal() {
    this.openImagesModal = false
  }
  openImagesModalFunction() {
    this.openImagesModal = true
  }

  checkPrice() {
    let pricesValue: any = []
    this.event.price.forEach((price: any) => {
      pricesValue.push(price.cost_rub)
    })
    let prices = this.event.price
    let pricesLenght = prices.length - 1

    if (prices && prices.length != 0) {
      if (prices[pricesLenght].cost_rub == prices[0].cost_rub && prices[0].cost_rub !== 0) {
        this.priceState = `${prices[0].cost_rub}₽`
        this.priceStateForShow = `${prices[0].cost_rub} ₽`
      }
      if (prices[pricesLenght].cost_rub == prices[0].cost_rub && prices[0].cost_rub == 0) {
        this.priceState = `Бесплатно`
        this.priceStateForShow = `Бесплатно`
      }
      if (prices[pricesLenght].cost_rub != prices[0].cost_rub && prices[0].cost_rub) {
        let minPrice
        let maxPrice
        minPrice = Math.min(...pricesValue)
        maxPrice = Math.max(...pricesValue)
        this.priceState = `От ${minPrice}`
        this.priceStateForShow = `От ${minPrice}₽ до ${maxPrice}₽`
      }
    } else {
      this.priceState = `Бесплатно`
      this.priceStateForShow = `Бесплатно`
    }
    // if (prices && prices.length != 0) {
    //   if (prices[0].cost_rub == 0 && prices[0].cost_rub == prices[prices.length - 1].cost_rub) {
    //     this.priceState = 'Бесплатно'
    //     this.priceStateForShow = 'Бесплатно'
    //   }
    //   if (prices[0].cost_rub == prices[prices.length - 1].cost_rub && prices[0] !== 0) {
    //     this.priceState = prices[0].cost_rub + '₽'
    //     this.priceStateForShow = prices[0].cost_rub + '₽'
    //   }
    //   if (prices[0] != prices[prices.length - 1] && prices[0] !== 0) {
    //     this.priceState = prices[0].cost_rub
    //     let minPrice = prices[0].cost_rub
    //     let maxPrice = prices[0].cost_rub
    //     prices.forEach((price: any) => {
    //       price.cost_rub < minPrice ? (minPrice = price.cost_rub) : null
    //       price.cost_rub > maxPrice ? (maxPrice = price.cost_rub) : null
    //     })

    //     if (minPrice == 0 && maxPrice == 0) {
    //       this.priceState = 'Бесплатно'
    //       this.priceStateForShow = 'Бесплатно'
    //     } else if (minPrice == maxPrice && maxPrice != 0) {
    //       this.priceState = 'от ' + minPrice + '₽'
    //       this.priceStateForShow = 'от ' + minPrice + '₽' + ' до ' + maxPrice + '₽'
    //     }
    //   }
    // } else {
    //   this.priceState = 'Бесплатно'
    //   this.priceStateForShow = 'Бесплатно'
    // }
  }

  clearDescription() {
    return this.sanitizer.bypassSecurityTrustHtml(this.textFormat.formatingText(this.event.description))
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

  toggleFavorite(event: any) {
    if (!this.userAuth) {
      this.favorite = !this.favorite
      if (this.favorite === true) {
        this.likeUrl = 'assets/icons/like-active.svg'
        if (!this.favoritesTapeService.events.find((item: any) => item.id === event.id)) {
          this.favoritesTapeService.events.push(event)
          localStorage.setItem('tempFavorites', JSON.stringify(this.favoritesTapeService.events))
        }
      } else {
        this.likeUrl = 'assets/icons/like.svg'
        if (this.favoritesTapeService.events.length > 0) {
          this.favoritesTapeService.events = this.favoritesTapeService.events.filter(
            (item: any) => item.id !== event.id,
          )
          localStorage.setItem('tempFavorites', JSON.stringify(this.favoritesTapeService.events))
        } else {
          this.favoritesTapeService.events = []
          localStorage.setItem('tempFavorites', JSON.stringify(this.favoritesTapeService.events))
        }
      }
    } else {
      this.loadingFavotire = true // для отображения спинера
      this.eventsService
        .toggleFavorite(event.id)
        .pipe(
          tap((res) => {
            this.favorite = !this.favorite

            if (this.favorite === true) {
              this.likeUrl = 'assets/icons/like-active.svg'
            } else {
              this.likeUrl = 'assets/icons/like.svg'
            }
            this.loadingLike = false
            this.loadingFavotire = false
          }),
          finalize(() => {
            this.getEvent()
            this.clearTempUsersFavorites()
            this.getFavoritesUsers()
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

  getOrganization() {
    this.eventsService
      .getOrganization(this.event.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.organization = res.organization
      })
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
            this.like ? this.startLikesCount++ : this.startLikesCount !== 0 ? this.startLikesCount-- : 0
            this.like ? (this.likeUrl = 'assets/icons/like-active.svg') : (this.likeUrl = 'assets/icons/like.svg')
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

  ionViewWillEnter() {
    //Получаем ид ивента из параметра маршрута
    this.wait = true
    this.nextPage = true
    this.nextPageFavoritesUser = true
    this.eventsCity = []
    this.userAuth = this.authService.getAuthState()

    this.queryBuilderService.paginationPublicEventsForTapeRecomendate.next('')
    this.queryBuilderService.paginationUsersFavoritesCurrentPage.next('')
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.eventId = params['id']
    })
    this.viewsService
      .addViewInEvent(String(this.eventId))
      .pipe()
      .subscribe((res: any) => {})

    if (this.router.url !== '/cabinet/events/create') {
      this.loadingFavotire = true
      // this.favorite ? (this.likeUrl = 'assets/icons/like-active.svg') : (this.likeUrl = 'assets/icons/like.svg')
      this.getEvent()
      this.checkFavorite()
      this.loadingFavotire = false
      this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        this.loadMore = true
        this.locationId = Number(value)
        this.places = []
        this.setLocationForPlaces()
      })
      // this.router.events.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      //   this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next('')
      // })
    }
  }
  ionViewDidLeave() {}
  ngOnInit() {}

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
