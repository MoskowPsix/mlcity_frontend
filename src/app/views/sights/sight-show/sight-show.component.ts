import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
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
  filter,
} from 'rxjs'
import { ISight } from 'src/app/models/sight'
import { SightsService } from 'src/app/services/sights.service'
import { IonicSlides } from '@ionic/angular'
import { register } from 'swiper/element/bundle'
import { environment } from 'src/environments/environment'
import { YaReadyEvent } from 'angular8-yandex-maps'
import { MessagesAuth } from 'src/app/enums/messages-auth'
import { ToastService } from 'src/app/services/toast.service'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { AuthService } from 'src/app/services/auth.service'
// import { Swiper } from 'swiper/types';
import { Location } from '@angular/common'
import { Metrika } from 'ng-yandex-metrika'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'
import { HelpersService } from 'src/app/services/helpers.service'
import { ContentObserver } from '@angular/cdk/observers'
import { QueryBuilderService } from 'src/app/services/query-builder.service'

register()
@Component({
  selector: 'app-sight-show',
  templateUrl: './sight-show.component.html',
  styleUrls: ['./sight-show.component.scss'],
})
export class SightShowComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>()

  swiperModules = [IonicSlides]

  userAuth: boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  sightId?: number
  sight?: any
  eventsInSight!: any
  loadMoreEventsInSigthState: boolean = false
  loadingSight: boolean = true

  map!: YaReadyEvent<ymaps.Map>

  favorite: boolean = false
  loadingFavorite: boolean = false

  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0
  workTimeCult: string = ''
  workTimeCultValue: number = 0
  workTimeCultOb: any = {}
  constructor(
    private route: ActivatedRoute,
    private sightsService: SightsService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private metrika: Metrika,
    private location: Location,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private queryBuilderService: QueryBuilderService,
  ) {
    let prevPath = this.location.path()
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const newPath = location.path()
        this.metrika.hit(newPath, {
          referer: prevPath,
        })
        prevPath = newPath
      })
  }

  formatingTime() {
    let daysTime = this.workTimeCult
    let text = this.workTimeCult.match(/\((.*?)\)/g)
    if (text) {
      daysTime = this.workTimeCult.replace(text![0], '')
    }
    let dayArray = daysTime.split(',')
    for (let i = 0; i < dayArray.length; i++) {
      dayArray[i] = dayArray[i].slice(4)
      dayArray[i] = dayArray[i].replace(/^\s+/, '')
      if (dayArray[i].length > 15) {
        this.workTimeCultValue++
        break
      }
    }
    this.workTimeCultOb = {
      monday: dayArray[0],
      tuesday: dayArray[1],
      wednesday: dayArray[2],
      thursday: dayArray[3],
      Friday: dayArray[4],
      saturday: dayArray[5],
      sunday: dayArray[6],
      text: text,
    }
  }

  getSight() {
    this.sightsService
      .getSightById(this.sightId!)
      .pipe(
        retry(3),
        tap(() => (this.loadingSight = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((sight: any) => {
        if (sight) {
          this.sight = sight
          if (sight.cult_id != 0) {
            this.workTimeCult = sight.work_time
            this.formatingTime()
          }
          this.sightsService
            .getEventInSight(this.sight.id)
            .subscribe((response: any) => {
              if (response.events.data.length > 0) {
                this.eventsInSight = response.events.data
                this.queryBuilderService.paginationEventsInSightCurrentPage.next(
                  response.events.next_cursor,
                )
                if (response.events.next_cursor == null) {
                  this.loadMoreEventsInSigthState = true
                }
              }
            })
        }
        this.titleService.setTitle(sight.name)
        this.metaService.updateTag({
          name: 'description',
          content: sight.description,
        })
        this.startLikesCount = this.sight?.likes
          ? this.sight.likes.vk_count + this.sight.likes.local_count
          : 0
      })
  }

  loadMoreEventsInSight() {
    this.loadMoreEventsInSigthState = true
    this.sightsService
      .getEventInSight(
        this.sight.id,
        this.queryBuilderService.queryBuilder('buildQueryEventsInSight'),
      )
      .pipe(
        tap(() => {
          this.loadMoreEventsInSigthState = false
        }),
      )
      .subscribe((response: any) => {
        this.eventsInSight.push(...response.events.data)
        this.queryBuilderService.paginationEventsInSightCurrentPage.next(
          response.events.data.next_cursor,
        )
        if (response.events.data.next_cursor == null) {
          this.loadMoreEventsInSigthState = true
        }
      })
  }

  checkLiked() {
    if (this.userAuth)
      this.sightsService
        .checkLiked(this.sightId!)
        .pipe(retry(3), takeUntil(this.destroy$))
        .subscribe((liked: boolean) => {
          this.like = liked
        })
  }

  checkFavorite() {
    if (this.userAuth)
      this.sightsService
        .checkFavorite(this.sightId!)
        .pipe(retry(3), takeUntil(this.destroy$))
        .subscribe((favorite: boolean) => {
          this.favorite = favorite
        })
  }

  onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>): void {
    let icoLink =
      this.sight && this.sight.types && this.sight.types.length
        ? this.host + ':' + this.port + this.sight.types[0].ico
        : ''
    this.map = { target, ymaps }
    //Создаем метку
    target.geoObjects.add(
      new ymaps.Placemark(
        [this.sight?.latitude, this.sight?.longitude],
        {},
        {
          iconLayout: 'default#imageWithContent',
          iconContentLayout: ymaps.templateLayoutFactory.createClass(
            `'<div class="marker"><img src="${icoLink}"/></div>'`,
          ),
        },
      ),
    )
    this.map.target.controls.remove('zoomControl')
    this.map.target.behaviors.disable('drag')
  }

  toggleFavorite(sight_id: number) {
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      this.loadingFavorite = true // для отображения спинера
      this.sightsService
        .toggleFavorite(sight_id)
        .pipe(
          tap(() => {
            this.favorite = !this.favorite
            this.loadingFavorite = false
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

  toggleLike(sight_id: number) {
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      this.loadingLike = true // для отображения спинера
      this.sightsService
        .toggleLike(sight_id)
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
      this.sightId = params['id']
    })

    this.userAuth = this.authService.getAuthState()

    this.getSight()
    this.checkLiked()
    this.checkFavorite()
  }

  ngAfterViewInit() {
    this.cdr.detectChanges()
    // this.swiperRef.changes.pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
    //   this.swiper = res.first.nativeElement.swiper
    //   console.log(res.first.nativeElement.swiper)
    // });

    // this.swiper?.update()
    //console.log(this.swiper)
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
