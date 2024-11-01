import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone,
  Output,
  EventEmitter,
} from '@angular/core'

import { DatePipe } from '@angular/common'
import { catchError, delay, EMPTY, map, of, retry, Subject, switchMap, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { MessagesAuth } from 'src/app/enums/messages-auth'
import { AuthService } from 'src/app/services/auth.service'
import { EventsService } from 'src/app/services/events.service'
import { ToastService } from 'src/app/services/toast.service'
import { environment } from 'src/environments/environment'
import { VkService } from 'src/app/services/vk.service'
import { IonicSlides } from '@ionic/angular'
import { DomSanitizer } from '@angular/platform-browser'

import { register } from 'swiper/element/bundle'
import { Swiper } from 'swiper/types'
import { SightsService } from 'src/app/services/sights.service'
import { CommentsService } from 'src/app/services/comments.service'
import numeral from 'numeral'
import { HelpersService } from 'src/app/services/helpers.service'
import { Router } from '@angular/router'
import { Statuses } from 'src/app/enums/statuses-new'
register()

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private sightsService: SightsService,
    private commentsServices: CommentsService,
    private toastService: ToastService,
    private vkService: VkService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private helpers: HelpersService,
    private datePipe: DatePipe,
    private router: Router,
  ) {}

  private readonly destroy$ = new Subject<void>()

  @Input() callFromCabinet: boolean = true
  @Input() event!: any
  @Input() isSight: boolean = false
  @Input() myEvent: boolean = false
  @Input() cardSize: string = ''
  @Output() eventClicked: EventEmitter<any> = new EventEmitter()
  comments: boolean = false
  loadingComment: boolean = false

  @ViewChild('swiper')
  elementRef?: ElementRef
  viewElement: boolean = false
  viewElementTimeStart: number = 0
  viewElementTimeEnd: number = 0

  slugName?: string

  swiperRef: ElementRef | undefined
  swiper?: Swiper
  swiperCurrentSlide?: number
  swiperTotalSlids?: number
  placeId: any
  swiperModules = [IonicSlides]

  userAuth: boolean = false
  formatedStartDate!: any
  formatedEndDate!: any
  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  favorite: boolean = false
  loadingFavotire: boolean = false
  url!: string
  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0
  vkLikesCount: number | null = null
  viewCard: boolean = true
  dontEdit: boolean = true
  prices: number[] = []
  minPrice: number = 0
  maxPrice: number = 0
  statusColor: Record<string, string> = {
    Новое: '#3880FF',
    Изменено: '#F99011',
    Опубликовано: '#22CA3D',
    Отказ: '#E83940',
    Черновик: '#4C5861',
  }
  placeHolderImage: string = '/assets/images/nophoto.jpg'
  imageUrl: string = ''
  imageLoaded: boolean = false

  distanceCurrent(distance: number) {
    if (distance < 1) {
      return Math.round(distance * 10) * 100 + 'м.'
    } else {
      return Math.round(distance) + 'км.'
    }
  }
  eventNavigation() {
    this.isSight
      ? this.router.navigate(['/sights', this.event.id, this.slugName])
      : this.eventClicked.emit(this.event.id)
  }
  eventNavigationEdit() {
    this.isSight
      ? this.router.navigate(['/cabinet/sights/edit', this.event.id])
      : this.router.navigate(['/cabinet/events/edit', this.event.id])
  }

  checkEventStatus(event: any) {
    let status: any = ''
    if (event && event.statuses) {
      event.statuses.forEach((element: any) => {
        if (element.pivot.last) {
          status = element
        }
      })
      if (status.name == Statuses.draft) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }
  blockedRout() {
    this.dontEdit = false
  }
  toggleFavorite(event_id: number) {
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      if (!this.isSight) {
        this.loadingFavotire = true // для отображения спинера
        this.eventsService
          .toggleFavorite(event_id)
          .pipe(
            tap(() => {
              this.favorite = !this.favorite
              this.favorite ? this.event.favorites_users_count++ : this.event.favorites_users_count--
              this.loadingFavotire = false
            }),
            tap(() => {
              this.cdr.detectChanges()
            }),
            catchError((err) => {
              this.toastService.showToast(MessagesErrors.default, 'danger')
              return of(EMPTY)
            }),
            takeUntil(this.destroy$),
          )
          .subscribe()
      } else {
        this.loadingFavotire = true // для отображения спинера
        this.sightsService
          .toggleFavorite(event_id)
          .pipe(
            tap(() => {
              this.favorite = !this.favorite
              this.favorite ? this.event.favorites_users_count++ : this.event.favorites_users_count--

              this.loadingFavotire = false
            }),
            tap(() => {
              this.cdr.detectChanges()
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
  }

  showInfoAboutStatus() {
    switch (this.getLastStatus().name) {
      case Statuses.new:
        this.toastService.showToast('Находится на рассмотрении', 'primary')
        break
      case Statuses.changed:
        this.toastService.showToast('Находится на модерации', 'warning')
        break
      case Statuses.published:
        this.toastService.showToast('Находится в активном состоянии', 'success')
        break
      case Statuses.blocked:
        this.toastService.showToast('На данный момент заблокированно', 'danger')
        break
      case Statuses.denied:
        this.toastService.showToast('Было отклонено модератором', 'danger')
        break
      case Statuses.draft:
        this.toastService.showToast('Находится в черновиках', 'secondary')
    }
  }

  getUrlFrame(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  toggleLike(event_id: number) {
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      if (!this.isSight) {
        this.loadingLike = true // для отображения спинера
        this.eventsService
          .toggleLike(event_id)
          .pipe(
            tap(() => {
              this.like = !this.like
              this.like ? this.event.liked_users_count++ : this.event.liked_users_count--
              this.loadingLike = false
            }),
            tap(() => {
              this.cdr.detectChanges()
            }),
            catchError((err) => {
              this.toastService.showToast(MessagesErrors.default, 'danger')
              return of(EMPTY)
            }),
            takeUntil(this.destroy$),
          )
          .subscribe()
      } else {
        this.loadingLike = true // для отображения спинера
        this.sightsService
          .toggleLike(event_id)
          .pipe(
            tap(() => {
              this.like = !this.like
              this.like ? this.event.liked_users_count++ : this.event.liked_users_count--
              this.loadingLike = false
            }),
            tap(() => {
              this.cdr.detectChanges()
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
  }

  getVkEventLikes(vk_group_id: number, vk_post_id: number) {
    this.vkService
      .getPostGroup(vk_group_id, vk_post_id)
      .pipe(
        delay(100),
        map((res) => (res.response && res.response.length ? res.response[0].likes.count : 0)),
        switchMap((count) => {
          //if (count !== 0){
          this.eventsService
            .updateEventVkLIkes(this.event.id, count)
            .pipe(
              // обновляем на беке  кол-во вк лайков
              catchError((err) => {
                this.toastService.showToast(MessagesErrors.vkLikesError, 'secondary')
                return of(EMPTY)
              }),
              takeUntil(this.destroy$),
            )
            .subscribe()
          //}
          return of(count)
        }),
        tap((count) => {
          if (this.event.likes !== null) this.startLikesCount = this.event.likes.local_count + count // обновляем лайки в представлении
        }),
        catchError((err) => {
          this.toastService.showToast(MessagesErrors.vkLikesError, 'secondary')
          return of(EMPTY)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  //проверяем делал ли юзер лайк этого ивента в ВК
  isLikedUserVKEvent(group_id: number, post_id: number) {
    if (this.userAuth) {
      this.vkService
        .isLikedUserVKEvent(group_id, post_id)
        .pipe(
          delay(100),
          map((res) => res.response.liked),
          switchMap((liked) => {
            if (liked === 1) {
              this.eventsService
                .setEventUserLiked(this.event.id)
                .pipe(
                  tap((res) => {
                    if (res.likedUser) {
                      this.like = true
                    }
                  }),
                  catchError((err) => {
                    return of(EMPTY)
                  }),
                  takeUntil(this.destroy$),
                )
                .subscribe()
            }
            return of(EMPTY)
          }),
          catchError((err) => {
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe()
    }
  }
  getCurentNumber(numer: number) {
    if (numer <= 999) {
      return numeral(numer).format('0')
    } else {
      return numeral(numer).format('0.0a')
    }
  }

  getMinPrice(prices: any[]) {
    let sort_prices = prices.sort((a, b) => a.cost_rub - b.cost_rub)
    return sort_prices[0].cost_rub
  }

  getMaxPrice(prices: any[]) {
    let sort_prices = prices.sort((a, b) => a.cost_rub - b.cost_rub)
    return sort_prices[sort_prices.length - 1].cost_rub
  }

  findPrice() {
    if ((!this.isSight && this.event.price) || (!this.isSight && this.event.prices)) {
      if (this.event.price) {
        for (let i = 0; i < this.event.price.length; i++) {
          this.prices.push(Number(this.event.price[i].cost_rub))
        }
      } else if (this.event.prices) {
        for (let i = 0; i < this.event.prices.length; i++) {
          this.prices.push(Number(this.event.prices[i].cost_rub))
        }
      }

      if (this.prices.length > 0) {
        this.minPrice = Math.min(...this.prices)
        this.maxPrice = Math.max(...this.prices)
      } else {
        this.minPrice = 0
        this.maxPrice = 0
      }
    }
  }

  getLastStatusColor() {
    let status: string = this.getLastStatus().name

    return this.statusColor[status]
  }

  getLastStatus() {
    let status: any
    this.event.statuses.forEach((element: any) => {
      if (element.pivot.last) {
        status = element
      }
    })

    return status
  }

  changeBackgroundImage() {
    this.imageLoaded = true
    this.placeHolderImage = this.event.files[0].link

    setTimeout(() => {
      this.imageLoaded = false
    }, 500) // Time in ms should match the CSS transition time
  }

  ngAfterViewInit(): void {
    this.swiper = this.swiperRef?.nativeElement.swiper
    setTimeout(() => {
      this.swiperCurrentSlide = this.swiper?.realIndex! + 1
      this.swiperTotalSlids = this.swiper?.slides.length
      this.swiper?.autoplay.start(), 1000
    }) // Без этого костыля автоплей работает только в первой карточке

    this.swiper?.on('slideChange', () => {
      this.swiperCurrentSlide = this.swiper?.realIndex! + 1
    })

    this.cdr.detectChanges()

    this.swiper?.update()
  }

  toggleComment() {
    this.loadingComment = true
    if (!this.comments && !this.event.comments && !this.isSight) {
      this.commentsServices
        .getCommentsEventsIds(this.event.id)
        .pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.loadingComment = false
            this.comments = true
          }),
          map((response: any) => {
            this.event.comments = response.comments
          }),
          tap(() => {
            this.cdr.detectChanges()
          }),
          catchError((err) => {
            console.log(err)
            return of(EMPTY)
          }),
        )
        .subscribe((response: any) => {
          // this.event['comments'] = response.comments
        })
    } else if (!this.comments && !this.event.comments && this.isSight) {
      this.commentsServices
        .getCommentsSightsIds(this.event.id)
        .pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.loadingComment = false
            this.comments = true
          }),
          map((response: any) => {
            this.event.comments = response.comments
          }),
          tap(() => {
            this.cdr.detectChanges()
          }),
          catchError((err) => {
            console.log(err)
            return of(EMPTY)
          }),
        )
        .subscribe((response: any) => {})
    } else if (!this.comments && this.event.comments) {
      this.comments = true
      this.loadingComment = false
    } else if (this.comments && this.event.comments) {
      this.comments = false
      this.loadingComment = false
    }
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    //console.log(this.event.id)
    this.destroy$.next()
    this.destroy$.complete()
  }
  ngOnInit() {
    this.formatedStartDate = this.datePipe.transform(this.event.date_start, 'dd-MMM')

    this.formatedEndDate = this.datePipe.transform(this.event.date_end, 'dd-MMM')

    this.userAuth = this.authService.getAuthState()
    this.findPrice()
    this.slugName = this.helpers.translit(this.event.name)
    this.startLikesCount = this.event.likes ? this.event.likes.vk_count + this.event.likes.local_count : 0
    this.favorite = this.event.favorites_users_exists!
    this.like = this.event.liked_users_exists!
    this.viewCard = this.checkEventStatus(this.event)
    // window.addEventListener('scrollend', this.scrollEvent, true);

    //КИдаем запрос в ВК чтобы обновить лайки и лайкнуть у нас если юзер лайкнул в ВК
    if (this.event.vk_group_id && this.event.vk_post_id) {
      this.getVkEventLikes(this.event.vk_group_id, this.event.vk_post_id)
      this.isLikedUserVKEvent(this.event.vk_group_id, this.event.vk_post_id)
    }
  }
}
