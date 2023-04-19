import { Component, Input, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core'
import { catchError, delay, EMPTY, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { MessagesAuth } from 'src/app/enums/messages-auth'
import { IEvent } from 'src/app/models/events'
import { AuthService } from 'src/app/services/auth.service'
import { EventsService } from 'src/app/services/events.service'
import { ToastService } from 'src/app/services/toast.service'
import { environment } from 'src/environments/environment'
import { VkService } from 'src/app/services/vk.service'
import { IonicSlides } from '@ionic/angular'

import {register} from 'swiper/element/bundle'
import {Swiper} from 'swiper/types'

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit, OnDestroy, AfterViewInit  {

  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private toastService: ToastService,
    private vkService: VkService,
    private cdr: ChangeDetectorRef
  ) { }
  
  private readonly destroy$ = new Subject<void>()

  @Input() callFromCabinet: boolean = true
  @Input() event!: IEvent

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined
  swiper?: Swiper
  swiperCurrentSlide?: number
  swiperTotalSlids?: number

  swiperModules = [IonicSlides]

  userAuth: boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  favorite: boolean = false
  loadingFavotire: boolean = false

  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0
  vkLikesCount: number | null = null

  toggleFavorite(event_id:number){
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      this.loadingFavotire = true // для отображения спинера
      this.eventsService.toggleFavorite(event_id).pipe(
        tap(() => {
          this.favorite = !this.favorite
          this.loadingFavotire = false
        }),
        catchError((err) =>{
          this.toastService.showToast(MessagesErrors.default, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe()
    }  
  }

  toggleLike(event_id:number){
    if (!this.userAuth) {
      this.toastService.showToast(MessagesAuth.notAutorize, 'warning')
    } else {
      this.loadingLike = true // для отображения спинера
      this.eventsService.toggleLike(event_id).pipe(
        tap(() => {
          this.like = !this.like
          this.like 
            ? this.startLikesCount++ 
            : this.startLikesCount !== 0 
              ? this.startLikesCount-- 
              : 0
          this.loadingLike = false
        }),
        catchError((err) =>{
          this.toastService.showToast(MessagesErrors.default, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe()
    }
  }

  getVkEventLikes(vk_group_id:number, vk_post_id:number){
    this.vkService.getPostGroup(vk_group_id, vk_post_id).pipe(
      delay(100),
      map((res) => res.response && res.response.length ? res.response[0].likes.count : 0),
      switchMap((count) => {
        //if (count !== 0){
          this.eventsService.updateEventVkLIkes(this.event.id, count).pipe( // обновляем на беке  кол-во вк лайков
            catchError((err) =>{
              //console.log(err)
              this.toastService.showToast(MessagesErrors.vkLikesError, 'secondary')
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe() 
        //}   
        return of(count) 
      }),
      tap((count) => {    
        if (this.event.likes !== null) 
          this.startLikesCount = this.event.likes.local_count + count // обновляем лайки в представлении
      }),
      catchError((err) =>{
        //console.log(err)
        this.toastService.showToast(MessagesErrors.vkLikesError, 'secondary')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  //проверяем делал ли юзер лайк этого ивента в ВК
  isLikedUserVKEvent(group_id: number, post_id:number){
    if (this.userAuth) {
      this.vkService.isLikedUserVKEvent(group_id, post_id).pipe(
        delay(100),
        map((res) => res.response.liked),
        switchMap((liked) => {
          if (liked === 1){
            this.eventsService.setEventUserLiked(this.event.id).pipe(
              tap((res) => {
                if (res.likedUser){
                 this.like = true 
                }
              }),
              catchError((err) =>{
                //console.log(err)
                return of(EMPTY) 
              }),
              takeUntil(this.destroy$)
            ).subscribe() 
          }
          return of(EMPTY) 
        }),
        catchError((err) =>{
          //console.log(err)
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe()
    }   
  }

  ngOnInit() {
    this.userAuth = this.authService.getAuthState()
    this.startLikesCount = this.event.likes ? this.event.likes.vk_count + this.event.likes.local_count : 0
    this.favorite = this.event.favorites_users_exists! 
    this.like = this.event.liked_users_exists!

    //КИдаем запрос в ВК чтобы обновить лайки и лайкнуть у нас если юзер лайкнул в ВК
    if(this.event.vk_group_id && this.event.vk_post_id){
      this.getVkEventLikes(this.event.vk_group_id, this.event.vk_post_id)
      this.isLikedUserVKEvent(this.event.vk_group_id, this.event.vk_post_id)
    }
  }

  ngAfterViewInit(): void {
    register()
    this.swiper = this.swiperRef?.nativeElement.swiper
    setTimeout(() => {
      this.swiperCurrentSlide = this.swiper?.realIndex! + 1
      this.swiperTotalSlids =  this.swiper?.slides.length 
      this.swiper?.autoplay.start()
      ,1000
    }) // Без этого костыля автоплей работает только в первой карточке

    this.swiper?.on('slideChange', () => {
      this.swiperCurrentSlide = this.swiper?.realIndex! + 1
    })
    this.cdr.detectChanges()
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }

}
