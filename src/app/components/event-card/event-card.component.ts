import { Component, Input, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core'
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

import {register} from 'swiper/element/bundle'
import {Swiper} from 'swiper/types'
import { SightsService } from 'src/app/services/sights.service'

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit, OnDestroy, AfterViewInit  {
  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private sightsService: SightsService,
    private toastService: ToastService,
    private vkService: VkService,
    private cdr: ChangeDetectorRef,
    private sanitizer:DomSanitizer,
  ) { }
  
  private readonly destroy$ = new Subject<void>()

  @Input() callFromCabinet: boolean = true
  @Input() event!: any
  @Input() isSight: boolean = false
  @Input() comments: boolean = true

  @ViewChild('swiper')
  elementRef?: ElementRef
  viewElement: boolean = false
  viewElementTimeStart: number = 0
  viewElementTimeEnd: number = 0

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
  //windowComment: boolean = false

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

  getUrlFrame(url:string)
  {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
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

  // showComment() {
  //   if (this.windowComment) {
  //     this.windowComment = false
  //   } else {
  //     this.windowComment = true
  //   }
  // }

  ngOnInit() {
    this.userAuth = this.authService.getAuthState()
    this.startLikesCount = this.event.likes ? this.event.likes.vk_count + this.event.likes.local_count : 0
    this.favorite = this.event.favorites_users_exists! 
    this.like = this.event.liked_users_exists!
    window.addEventListener('scroll', this.scrollEvent, true);

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
  
  scrollEvent = (event: any): void => {
    const boundingClientRect = this.elementRef?.nativeElement.getBoundingClientRect();
    if (boundingClientRect.top > (window.innerHeight - (window.innerHeight + window.innerHeight))/2 && boundingClientRect.top < window.innerHeight/2  && !this.viewElement && boundingClientRect.width !== 0 && boundingClientRect.width !== 0) {
      if (!this.viewElementTimeStart){
        this.viewElementTimeStart = new Date().getTime()
      } 
    } else if ((this.viewElementTimeStart && !this.viewElement) || ((this.viewElementTimeStart && !this.viewElement) && (boundingClientRect.width === 0 && boundingClientRect.width === 0))) {
      this.viewElementTimeEnd = new Date().getTime()
      let time: any
      time = (new Date().getTime() - this.viewElementTimeStart)/1000
      if (time > 3.141) {
        if (this.isSight) {
          this.sightsService.addView(this.event.id, time).pipe(
            delay(100),
            retry(3),
            catchError((err) =>{
              // console.log(err)
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response:any) => {
            // console.log(response)
           })
        } else {
          this.eventsService.addView(this.event.id, time).pipe(
            delay(100),
            retry(3),
            catchError((err) =>{
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response:any) => {
           })
        }
        this.viewElement = true
      }
      this.viewElementTimeStart = 0
      this.viewElementTimeEnd = 0
    }
    //console.log(boundingClientRect)
  }

  toggleComment() {
    this.comments ?  this.comments = false : this.comments = true
  }
  takeUntilDestroyed() {
    console.log(this.event.name)
  }
  ngOnDestroy(){
    // отписываемся от всех подписок
    //console.log(this.event.id)
    this.destroy$.next()
    this.destroy$.complete()
  }

}
