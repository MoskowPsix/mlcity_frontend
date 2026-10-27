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
  /**
   * Аккордеон по классам; внутри — заезды (live + finished) этого класса.
   * Кэш обязателен: таймер 100ms, нельзя группировать в шаблоне.
   */
  checkpointClassSections: {
    name: string
    participantCount: number
    heats: {
      id: string
      name: string
      status: 'live' | 'finished'
      rows: any[]
    }[]
  }[] = []
  checkpointClassAccordionValue: string[] = []
  private checkpointPoll?: ReturnType<typeof setInterval>
  private checkpointTimer?: ReturnType<typeof setInterval>
  private checkpointPusher?: Pusher
  private readonly zone = inject(NgZone)
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
      const pa = a?.place == null ? Number.POSITIVE_INFINITY : Number(a.place)
      const pb = b?.place == null ? Number.POSITIVE_INFINITY : Number(b.place)
      if (pa !== pb) return pa - pb
      return String(a?.start_number ?? '').localeCompare(String(b?.start_number ?? ''), 'ru', { numeric: true })
    })
  }

  private classNameOf(row: any): string {
    return (row?.group_name || '').trim() || 'Без класса'
  }

  /** Класс → заезды этого класса (сначала live, потом итоги). */
  private buildCheckpointClassSections(state: any): {
    name: string
    participantCount: number
    heats: { id: string; name: string; status: 'live' | 'finished'; rows: any[] }[]
  }[] {
    type HeatBucket = { id: string; name: string; status: 'live' | 'finished'; rows: any[] }
    const byClass = new Map<string, HeatBucket[]>()

    const pushHeat = (heat: any, status: 'live' | 'finished') => {
      const heatId = String(heat?.id ?? heat?.name ?? '')
      const heatName = heat?.name || heatId
      const rowsByClass = new Map<string, any[]>()
      for (const row of heat?.results || []) {
        const className = this.classNameOf(row)
        if (!rowsByClass.has(className)) rowsByClass.set(className, [])
        rowsByClass.get(className)!.push(row)
      }
      for (const [className, rows] of rowsByClass) {
        if (!byClass.has(className)) byClass.set(className, [])
        byClass.get(className)!.push({
          id: heatId,
          name: heatName,
          status,
          rows: this.sortCheckpointRows(rows),
        })
      }
    }

    if (state?.live) pushHeat(state.live, 'live')
    for (const heat of state?.heats || []) pushHeat(heat, 'finished')

    return [...byClass.entries()]
      .map(([name, heats]) => ({
        name,
        heats: heats.sort((a, b) => {
          if (a.status !== b.status) return a.status === 'live' ? -1 : 1
          return a.name.localeCompare(b.name, 'ru')
        }),
        participantCount: new Set(
          ([] as Array<string | number>).concat(
            ...heats.map((h: HeatBucket) =>
              h.rows.map((r: any) => r?.participant_id ?? `${r?.start_number}:${r?.name}`),
            ),
          ),
        ).size,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  }

  private mergeAccordionValue(current: string[] | undefined, names: string[]): string[] {
    if (!names.length) return []
    if (!current?.length) return [...names]
    const keep = current.filter((name) => names.includes(name))
    const added = names.filter((name) => !current.includes(name))
    return [...keep, ...added]
  }

  trackCheckpointClass(_index: number, section: { name: string }) {
    return section.name
  }

  trackCheckpointHeat(_index: number, heat: { id: string; status: string }) {
    return `${heat.status}:${heat.id}`
  }

  onCheckpointClassAccordionChange(ev: Event) {
    const value = (ev as CustomEvent)?.detail?.value
    this.checkpointClassAccordionValue = Array.isArray(value) ? value : value ? [value] : []
  }

  private startCheckpointResults() {
    if (this.checkpointPusher || this.checkpointPoll) return
    this.loadCheckpointResults()
    this.startCheckpointPoll() // REST fallback всегда (Pusher локально часто молчит)
    this.startCheckpointTimer()
    window.addEventListener('online', this.refreshCheckpointResults)
    document.addEventListener('visibilitychange', this.refreshCheckpointResults)
    const realtime = environment as { pusherKey?: string; pusherCluster?: string; pusherHost?: string; pusherPort?: number }
    if (!realtime.pusherKey) {
      return
    }
    this.checkpointPusher = new Pusher(realtime.pusherKey, {
      cluster: realtime.pusherCluster || 'mt1',
      wsHost: realtime.pusherHost,
      wsPort: realtime.pusherPort,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws'],
    })
    this.checkpointPusher.connection.bind('connected', () => this.refreshCheckpointResults())
    this.checkpointPusher.connection.bind('disconnected', () => this.startCheckpointPoll())
    this.checkpointPusher.connection.bind('unavailable', () => this.startCheckpointPoll())
    // Laravel broadcastAs → клиент обязан слушать с ведущей точкой
    this.checkpointPusher
      .subscribe(`checkpoint.event.${this.eventId}`)
      .bind('.checkpoint.results.updated', (payload: any) => {
        this.zone.run(() => this.applyCheckpointState(payload?.state ?? payload))
      })
  }

  private startCheckpointPoll() {
    if (this.checkpointPoll) return
    this.checkpointPoll = setInterval(() => this.loadCheckpointResults(), 2000)
  }

  private stopCheckpointPoll() {
    if (!this.checkpointPoll) return
    clearInterval(this.checkpointPoll)
    this.checkpointPoll = undefined
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
    this.checkpointClassSections = this.buildCheckpointClassSections(state)
    this.checkpointClassAccordionValue = this.mergeAccordionValue(
      this.checkpointClassAccordionValue,
      this.checkpointClassSections.map((s) => s.name),
    )
    this.tickCheckpointElapsed()
    this.cdr.markForCheck()
  }

  canOpenCommission() {
    const current = this.userService.getUserFromLocalStorage()
    return Number(current?.id) === Number(this.event?.user_id)
  }

  private loadCheckpointResults() {
    this.checkpointService.results(this.eventId!).pipe(takeUntil(this.destroy$)).subscribe({
      next: (state) => this.applyCheckpointState(state),
    })
  }

  ngOnDestroy() {
    this.stopCheckpointPoll()
    this.stopCheckpointTimer()
    window.removeEventListener('online', this.refreshCheckpointResults)
    document.removeEventListener('visibilitychange', this.refreshCheckpointResults)
    this.checkpointPusher?.disconnect()
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
