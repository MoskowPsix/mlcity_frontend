import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, Output, Input, inject, NgZone } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { Subject, takeUntil, tap, retry, catchError, of, EMPTY, map, delay, filter, timeInterval, finalize } from 'rxjs'
import Pusher from 'pusher-js'
import { CheckpointService } from 'src/app/services/checkpoint.service'
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
  checkpointResults: any
  /** HH:MM:SS.mmm с момента live.started_at */
  checkpointElapsed = '00:00:00'
  checkpointUpdatedAt: Date | null = null
  /** Live-заезд отдельной карточкой сверху (не в аккордеоне итогов). */
  checkpointLiveHeat: {
    id: string
    name: string
    typeSlug: string | null
    rows: any[]
  } | null = null
  /**
   * Завершённые заезды — по имени заезда (как мото), без группировки по классам.
   * Кэш обязателен: таймер 100ms, нельзя собирать в шаблоне.
   */
  checkpointFinishedHeats: {
    id: string
    name: string
    typeSlug: string | null
    startedAt: string | null
    finishedAt: string | null
    rows: any[]
    lapNumbers: number[]
  }[] = []
  checkpointHeatAccordionValue: string[] = []
  private checkpointKnownHeatIds: string[] = []
  private checkpointClosedHeatIds = new Set<string>()
  private checkpointAccordionSyncing = false
  private checkpointAccordionTouchedAt = 0
  private checkpointTimer?: ReturnType<typeof setInterval>
  private checkpointQualToggleTimer?: ReturnType<typeof setInterval>
  /** Fallback REST, если Soketi/broadcast молчит. */
  private checkpointPollTimer?: ReturnType<typeof setInterval>
  /** Игнор устаревших REST-ответов (иначе эфир «залипает» / пустеет). */
  private checkpointLoadSeq = 0
  /** Квалификация в эфире: чередование лучший/последний круг. */
  checkpointShowLastLap = false
  private checkpointPusher?: Pusher
  private checkpointRealtimeStarted = false
  private readonly zone = inject(NgZone)
  /** Разовый REST только после reconnect/visibility — не poll. */
  private readonly refreshCheckpointResults = () => {
    if (document.visibilityState === 'visible') this.loadCheckpointResults()
  }

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
    private checkpointService: CheckpointService,
    private userService: UserService,
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
          this.eventsService
            .getOrganization(this.event.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((response: any) => {
              this.organization = response.organization
              console.log(response.organization)
              this.checkMaterialLink()
            })
          this.setUsersCount()
          this.setUserViews()
          this.checkPrice()
          if (this.event.checkpoint_enabled) this.startCheckpointResults()

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
    if (this.event.views) {
      this.usersViews = this.numbersService.changeDischarge(Number(this.event.views.count))
    }
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
        .getLikedUsersById(String(this.eventId), this.queryBuilderService.queryBuilder('buildQueryUsersFavorites'))
        .pipe(
          finalize(() => {
            this.nextPageSpiner = false
          }),
        )
        .subscribe((res: any) => {
          this.usersInFavorite.push(...res.events.data)
          if (res.events.next_cursor) {
            this.queryBuilderService.paginationUsersFavoritesCurrentPage.next(res.events.next_cursor)
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
        } else {
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
    const prices = (this.event.price || [])
      .map((price: any) => Number(price.cost_rub) || 0)
      .filter((cost: number) => cost > 0)

    if (prices.length === 0) {
      this.priceState = `Бесплатно`
      this.priceStateForShow = `Бесплатно`
      return
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      this.priceState = `${minPrice}`
      this.priceStateForShow = `${minPrice}`
      return
    }

    // Несколько платных классов — показываем от самого дешёвого
    this.priceState = `От ${minPrice}`
    this.priceStateForShow = `От ${minPrice} до ${maxPrice}`
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
    if (this.authService.getAuthState()) {
      this.viewsService
        .addViewInEvent(String(this.eventId))
        .pipe()
        .subscribe((res: any) => {})
    }

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

  get checkpointHasBroadcast() {
    return !!(this.checkpointResults?.live || this.checkpointResults?.heats?.length)
  }

  private sortCheckpointRows(rows: any[]): any[] {
    return [...rows].sort((a, b) => {
      const rankPlace = (v: unknown): number => {
        if (v == null) return Number.POSITIVE_INFINITY
        const n = Number(v)
        return !Number.isFinite(n) || n <= 0 ? Number.POSITIVE_INFINITY : n
      }
      const pa = rankPlace(a?.place)
      const pb = rankPlace(b?.place)
      if (pa !== pb) return pa - pb
      return String(a?.start_number ?? '').localeCompare(String(b?.start_number ?? ''), 'ru', { numeric: true })
    })
  }

  isCheckpointQualification(typeSlug: string | null | undefined): boolean {
    return typeSlug === 'qualification_best'
  }

  checkpointResultColumnLabel(typeSlug: string | null | undefined, live = false): string {
    if (this.isCheckpointQualification(typeSlug)) {
      if (!live) return 'Лучший круг'
      return this.checkpointShowLastLap ? 'Последний круг' : 'Лучший круг'
    }
    return 'Время/Отст.'
  }

  checkpointDisplayTime(row: any, rows: any[], typeSlug: string | null | undefined, live = false): string {
    if (this.isCheckpointQualification(typeSlug)) {
      const ms = live && this.checkpointShowLastLap
        ? row?.last_lap_time_ms
        : (row?.best_lap_time_ms ?? row?.result_value_ms)
      return this.formatCheckpointMs(ms)
    }
    const leader = rows.find((r) => Number(r?.place) === 1) ?? rows[0]
    if (!leader || leader === row || Number(row?.place) === 1) {
      return this.formatCheckpointMs(row?.result_value_ms) || row?.result || '—'
    }
    const leaderLaps = Number(leader?.laps ?? 0)
    const rowLaps = Number(row?.laps ?? 0)
    if (leaderLaps > rowLaps) {
      const diff = leaderLaps - rowLaps
      return `+${diff} ${diff === 1 ? 'круг' : diff < 5 ? 'круга' : 'кругов'}`
    }
    const leaderMs = Number(leader?.result_value_ms)
    const rowMs = Number(row?.result_value_ms)
    if (!Number.isFinite(leaderMs) || !Number.isFinite(rowMs)) {
      return row?.result || '—'
    }
    return `+${this.formatCheckpointMs(Math.max(0, rowMs - leaderMs), true)}`
  }

  checkpointLapData(row: any, lapNumber: number): any | null {
    const laps = Array.isArray(row?.lap_times) ? row.lap_times : []
    return laps.find((l: any) => Number(l?.lap_number) === lapNumber) ?? null
  }

  formatCheckpointMs(ms: number | null | undefined, compact = false): string {
    if (ms == null || !Number.isFinite(Number(ms))) return '—'
    const totalMs = Math.max(0, Math.round(Number(ms)))
    const totalSeconds = Math.floor(totalMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const centi = Math.floor((totalMs % 1000) / 10)
    const pad = (n: number, w = 2) => String(n).padStart(w, '0')
    if (compact && hours === 0 && minutes === 0) {
      return `${pad(seconds)}.${pad(centi)}`
    }
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centi)}`
    }
    return `${pad(minutes)}:${pad(seconds)}.${pad(centi)}`
  }

  private buildCheckpointLiveHeat(state: any): {
    id: string
    name: string
    typeSlug: string | null
    rows: any[]
  } | null {
    const live = state?.live
    if (!live) return null
    return {
      id: String(live.id ?? live.name ?? 'live'),
      name: live.name || String(live.id ?? 'Эфир'),
      typeSlug: live.type_slug ?? null,
      rows: this.sortCheckpointRows(live.results || []),
    }
  }

  /** Завершённые заезды по имени (как мото), без разрезания по классам. */
  private buildCheckpointFinishedHeats(state: any): {
    id: string
    name: string
    typeSlug: string | null
    startedAt: string | null
    finishedAt: string | null
    rows: any[]
    lapNumbers: number[]
  }[] {
    const ts = (value: string | null) => (value ? new Date(value).getTime() : 0)
    return [...(state?.heats || [])]
      .map((heat: any) => {
        const rows = this.sortCheckpointRows(heat?.results || [])
        const maxLap = rows.reduce((max: number, row: any) => {
          const fromSplits = Array.isArray(row?.lap_times) ? row.lap_times.length : 0
          const fromCount = Number(row?.laps ?? 0)
          return Math.max(max, fromSplits, fromCount)
        }, 0)
        return {
          id: String(heat?.id ?? heat?.name ?? ''),
          name: heat?.name || String(heat?.id ?? 'Заезд'),
          typeSlug: heat?.type_slug ?? null,
          startedAt: heat?.started_at ?? null,
          finishedAt: heat?.finished_at ?? null,
          rows,
          lapNumbers: Array.from({ length: maxLap }, (_, i) => i + 1),
        }
      })
      .sort((a, b) => ts(b.finishedAt || b.startedAt) - ts(a.finishedAt || a.startedAt))
  }

  /**
   * Эфир — отдельная карточка сверху.
   * Аккордеон итогов: по умолчанию всё закрыто; открытое юзером не форсим.
   */
  private syncCheckpointAccordionValue(ids: string[]) {
    if (!ids.length) {
      this.setCheckpointAccordionValue([])
      return
    }

    for (const closed of [...this.checkpointClosedHeatIds]) {
      if (!ids.includes(closed)) this.checkpointClosedHeatIds.delete(closed)
    }

    const isFirstPaint = this.checkpointKnownHeatIds.length === 0
    if (isFirstPaint) {
      for (const id of ids) this.checkpointClosedHeatIds.add(id)
    } else {
      for (const id of ids) {
        if (!this.checkpointKnownHeatIds.includes(id)) this.checkpointClosedHeatIds.add(id)
      }
    }

    const next = ids.filter((id) => !this.checkpointClosedHeatIds.has(id))
    this.setCheckpointAccordionValue(next)
    this.checkpointKnownHeatIds = [...ids]
  }

  private setCheckpointAccordionValue(next: string[]) {
    const same =
      next.length === this.checkpointHeatAccordionValue.length &&
      next.every((id, i) => id === this.checkpointHeatAccordionValue[i])
    if (same) return
    this.checkpointAccordionSyncing = true
    this.checkpointHeatAccordionValue = next
    setTimeout(() => {
      this.checkpointAccordionSyncing = false
    }, 120)
  }

  trackCheckpointHeat(_index: number, heat: { id: string }) {
    return heat.id
  }

  onCheckpointHeatAccordionChange(ev: Event) {
    if (this.checkpointAccordionSyncing) return
    const raw = (ev as CustomEvent)?.detail?.value
    const open = Array.isArray(raw) ? raw : raw ? [raw] : []
    const justTouched = Date.now() - this.checkpointAccordionTouchedAt < 800
    if (
      justTouched &&
      this.checkpointClosedHeatIds.size > 0 &&
      open.length === this.checkpointKnownHeatIds.length &&
      this.checkpointKnownHeatIds.every((id) => open.includes(id))
    ) {
      this.setCheckpointAccordionValue(
        this.checkpointKnownHeatIds.filter((id) => !this.checkpointClosedHeatIds.has(id)),
      )
      return
    }
    this.checkpointAccordionTouchedAt = Date.now()
    this.checkpointHeatAccordionValue = open
    for (const id of this.checkpointKnownHeatIds) {
      if (open.includes(id)) this.checkpointClosedHeatIds.delete(id)
      else this.checkpointClosedHeatIds.add(id)
    }
  }

  private startCheckpointResults() {
    if (this.checkpointRealtimeStarted) return
    this.checkpointRealtimeStarted = true
    // Стартовый снимок + WS; poll — страховка (на проде бывало Pusher\Pusher not found)
    this.loadCheckpointResults()
    this.startCheckpointTimer()
    this.startCheckpointPoll()
    window.addEventListener('online', this.refreshCheckpointResults)
    document.addEventListener('visibilitychange', this.refreshCheckpointResults)

    const realtime = environment as {
      pusherKey?: string
      pusherCluster?: string
      pusherHost?: string
      pusherPort?: number
      pusherForceTLS?: boolean
    }
    if (!realtime.pusherKey) {
      console.warn('[checkpoint] pusherKey missing — live updates disabled')
      return
    }
    const forceTLS = !!realtime.pusherForceTLS
    const wsPort = realtime.pusherPort ?? (forceTLS ? 443 : 80)
    this.checkpointPusher = new Pusher(realtime.pusherKey, {
      cluster: realtime.pusherCluster || 'mt1',
      wsHost: realtime.pusherHost,
      wsPort,
      wssPort: wsPort,
      forceTLS,
      disableStats: true,
      enabledTransports: forceTLS ? ['ws', 'wss'] : ['ws'],
    })
    // После обрыва pusher-js сам реконнектится; один REST на connected — догнать пропущенное
    this.checkpointPusher.connection.bind('connected', () => this.refreshCheckpointResults())
    this.checkpointPusher.connection.bind('error', (err: unknown) => {
      console.warn('[checkpoint] pusher error', err)
    })
    // Laravel broadcastAs → клиент обязан слушать с ведущей точкой
    this.checkpointPusher
      .subscribe(`checkpoint.event.${this.eventId}`)
      .bind('.checkpoint.results.updated', (payload: any) => {
        this.zone.run(() => {
          // WS свежее любого in-flight REST
          this.checkpointLoadSeq++
          this.applyCheckpointState(payload?.state ?? payload)
        })
      })
  }

  private startCheckpointTimer() {
    if (this.checkpointTimer) return
    this.tickCheckpointElapsed()
    this.checkpointTimer = setInterval(() => this.tickCheckpointElapsed(), 100)
  }

  private stopCheckpointTimer() {
    if (!this.checkpointTimer) return
    clearInterval(this.checkpointTimer)
    this.checkpointTimer = undefined
  }

  private startCheckpointPoll() {
    if (this.checkpointPollTimer) return
    this.checkpointPollTimer = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      this.loadCheckpointResults()
    }, 1500)
  }

  private stopCheckpointPoll() {
    if (!this.checkpointPollTimer) return
    clearInterval(this.checkpointPollTimer)
    this.checkpointPollTimer = undefined
  }

  private tickCheckpointElapsed() {
    const startedAt = this.checkpointResults?.live?.started_at
    if (!startedAt) {
      this.checkpointElapsed = '00:00:00'
      return
    }
    const ms = Math.max(0, Date.now() - new Date(startedAt).getTime())
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    this.checkpointElapsed = `${pad(h)}:${pad(m)}:${pad(s)}`
  }

  private applyCheckpointState(state: any) {
    this.checkpointResults = state
    this.checkpointUpdatedAt = new Date()
    this.checkpointLiveHeat = this.buildCheckpointLiveHeat(state)
    this.checkpointFinishedHeats = this.buildCheckpointFinishedHeats(state)
    this.syncCheckpointAccordionValue(this.checkpointFinishedHeats.map((h) => h.id))
    this.syncCheckpointQualToggle()
    this.tickCheckpointElapsed()
    this.cdr.markForCheck()
  }

  private syncCheckpointQualToggle() {
    const need =
      !!this.checkpointLiveHeat && this.isCheckpointQualification(this.checkpointLiveHeat.typeSlug)
    if (need && !this.checkpointQualToggleTimer) {
      this.checkpointShowLastLap = false
      this.checkpointQualToggleTimer = setInterval(() => {
        this.checkpointShowLastLap = !this.checkpointShowLastLap
        this.cdr.markForCheck()
      }, 5000)
    } else if (!need && this.checkpointQualToggleTimer) {
      clearInterval(this.checkpointQualToggleTimer)
      this.checkpointQualToggleTimer = undefined
      this.checkpointShowLastLap = false
    }
  }

  canOpenCommission() {
    const current = this.userService.getUserFromLocalStorage()
    return Number(current?.id) === Number(this.event?.user_id)
  }

  private loadCheckpointResults() {
    const seq = ++this.checkpointLoadSeq
    this.checkpointService.results(this.eventId!).pipe(takeUntil(this.destroy$)).subscribe({
      next: (state) => {
        if (seq !== this.checkpointLoadSeq) return
        this.applyCheckpointState(state)
      },
    })
  }

  ngOnDestroy() {
    this.stopCheckpointTimer()
    this.stopCheckpointPoll()
    if (this.checkpointQualToggleTimer) {
      clearInterval(this.checkpointQualToggleTimer)
      this.checkpointQualToggleTimer = undefined
    }
    window.removeEventListener('online', this.refreshCheckpointResults)
    document.removeEventListener('visibilitychange', this.refreshCheckpointResults)
    this.checkpointPusher?.disconnect()
    this.checkpointPusher = undefined
    this.checkpointRealtimeStarted = false
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
