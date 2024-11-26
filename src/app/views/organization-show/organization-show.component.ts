import { Component, Inject, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { catchError, EMPTY, of, retry, Subject, takeUntil, tap } from 'rxjs'
import { IOrganization } from 'src/app/models/organization'
import { OrganizationService } from 'src/app/services/organization.service'
import { environment } from 'src/environments/environment'
import { SightsService } from 'src/app/services/sights.service'
import { ISight } from 'src/app/models/sight'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { take } from 'lodash'
import { ToastService } from 'src/app/services/toast.service'
import { IEvent } from 'src/app/models/event'
import { MessagesAuth } from 'src/app/enums/messages-auth'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { AuthService } from 'src/app/services/auth.service'
import { FavoritesTapeService } from '../cabinet/favorites/favorites-tape.service'
import { UserService } from 'src/app/services/user.service'

@Component({
  selector: 'app-organization-show',
  templateUrl: './organization-show.component.html',
  styleUrls: ['./organization-show.component.scss'],
})
export class OrganizationShowComponent implements OnInit {
  loading: boolean = true
  userId!: number
  userInSightId!: number
  id: string = ''
  sight!: ISight
  avatarUrl: string = ''
  events: IEvent[] = []
  userAuth: boolean = false
  userPlug: boolean = false
  eventsExpired: IEvent[] = []
  notFound: boolean = false
  notFoundExpired: boolean = false
  nextPage: boolean = true
  likeUrl: string = 'assets/icons/like.svg'
  loadingFavotire: boolean = false
  openImagesModal: boolean = false
  place!: any
  nextPageExpired: boolean = true
  favorite: boolean = false
  spiner: boolean = false
  spinerExpired: boolean = false
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  private readonly destroy$ = new Subject<void>()
  constructor(
    private sightsService: SightsService,
    private router: ActivatedRoute,
    private routerOnNavigate: Router,
    //Ещ] один роутер из за того что разные роуты
    private organizationService: OrganizationService,
    private queryBuilderService: QueryBuilderService,
    private toastService: ToastService,
    private authService: AuthService,
    private favoritesTapeService: FavoritesTapeService,
    private UserService: UserService,
  ) {}

  visibilityButtonCreateEvent() {
    this.userInSightId = this.sight.user_id
    this.UserService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.userId = res.id
      })
  }

  getOrganizationId() {
    this.id = this.router.snapshot.paramMap.get('id')!
  }
  checkAvatar() {
    if (this.sight.files![0] && this.sight.files![0].link.includes('https')) {
      this.avatarUrl = this.sight.files![0].link
    } else {
      if (this.sight.files![0]) {
        this.avatarUrl = `${this.backendUrl}${this.sight.files![0].link}`
      }
    }
  }

  getOrganizationEventsExpired() {
    if (this.nextPageExpired) {
      this.spinerExpired = true
      this.organizationService
        .getOrganizationEvents(
          String(this.sight.organization!.id),
          this.queryBuilderService.queryBuilder('eventPlacesExpired'),
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.eventsExpired.push(...res.events.data)
          res.events.next_cursor
            ? this.queryBuilderService.paginataionPublicEventPlacesExpiredCurrentPage.next(res.events.next_cursor)
            : this.queryBuilderService.paginataionPublicEventPlacesExpiredCurrentPage.next('')
          if (res.events.next_cursor) {
            this.nextPageExpired = true
            this.spinerExpired = false
          } else {
            this.nextPageExpired = false
            this.spinerExpired = false
          }
          this.eventsExpired.length ? (this.notFoundExpired = false) : (this.notFoundExpired = true)
        })
    }
  }
  toggleFavorite(sight: any) {
    if (!this.userAuth) {
      this.favorite = !this.favorite
      if (this.favorite === true) {
        this.likeUrl = 'assets/icons/like-active.svg'
        if (!this.favoritesTapeService.sights.find((item: any) => item.id === sight.id)) {
          this.favoritesTapeService.sights.push(sight)
          localStorage.setItem('tempFavoritesSights', JSON.stringify(this.favoritesTapeService.sights))
        }
      } else {
        this.likeUrl = 'assets/icons/like.svg'
        this.favoritesTapeService.sights = this.favoritesTapeService.sights.filter((item: any) => item.id !== sight.id)
        localStorage.setItem('tempFavoritesSights', JSON.stringify(this.favoritesTapeService.events))
      }
    } else {
      this.loadingFavotire = true // для отображения спинера
      this.sightsService
        .toggleFavorite(this.sight.id)
        .pipe(
          tap((res) => {
            this.favorite = !this.favorite

            if (this.favorite === true) {
              this.likeUrl = 'assets/icons/like-active.svg'
            } else {
              this.likeUrl = 'assets/icons/like.svg'
            }
            this.loadingFavotire = false
          }),
          catchError((err) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            this.loadingFavotire = false
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe()
    }
  }
  getOrganizationEvents() {
    if (this.nextPage) {
      this.spiner = true
      this.organizationService
        .getOrganizationEvents(
          String(this.sight.organization!.id),
          this.queryBuilderService.queryBuilder('eventPlaces'),
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.events.push(...res.events.data)

          res.events.next_cursor
            ? this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next(res.events.next_cursor)
            : this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next('')
          if (res.events.next_cursor) {
            this.nextPage = true
            this.spiner = false
          } else {
            this.nextPage = false
            this.spiner = false
          }
          this.events.length ? (this.notFound = false) : (this.notFound = true)
        })
    }
  }

  checkFavorite() {
    this.loadingFavotire = true
    if (this.userAuth) {
      this.sightsService
        .checkFavorite(this.sight.id!)
        .pipe(
          retry(3),
          takeUntil(this.destroy$),
          catchError((err) => {
            this.loadingFavotire = false
            console.log(err)
            return EMPTY
          }),
        )
        .subscribe((favorite: any) => {
          this.favorite = favorite.is_favorite
          this.loadingFavotire = false
          if (this.favorite === true) {
            this.likeUrl = 'assets/icons/like-active.svg'
          } else {
            this.likeUrl = 'assets/icons/like.svg'
          }
        })
    } else {
      this.loadingFavotire = false
      if (this.favoritesTapeService.sights.find((item: any) => item.id == this.sight.id)) {
        this.favorite = true
        this.likeUrl = 'assets/icons/like-active.svg'
      }
    }
  }
  closeImagesModal() {
    this.openImagesModal = false
  }
  openImagesModalFunction() {
    this.openImagesModal = true
  }
  eventNavigation(event: any) {
    this.routerOnNavigate.navigate(['/events', event])
  }
  getOrganization(id: string) {
    this.sightsService
      .getSightById(Number(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.sight = res.sight
        this.visibilityButtonCreateEvent()
        this.loading = false
        if (this.sight && this.sight!.files.length == 0 && this.sight.types) {
          console.log(this.sight.types![0].ico)
          this.avatarUrl = `${this.backendUrl}${this.sight.types![0].ico}`
          this.userPlug = true
        }
        this.getOrganizationEvents()
        this.getOrganizationEventsExpired()
        this.checkAvatar()
        this.checkFavorite()
        this.loadingFavotire = false
        this.loading = false
        this.place = {
          address: this.sight.address,
          latitude: this.sight.latitude,
          longitude: this.sight.longitude,
        }
      })
  }

  visibilityButton() {}
  ngOnInit() {}

  ionViewWillEnter() {
    this.getOrganizationId()
    this.userAuth = this.authService.getAuthState()
    this.id ? this.getOrganization(this.id) : null
  }
}
