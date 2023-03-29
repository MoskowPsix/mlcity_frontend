import { Component, OnInit,OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { retry } from 'rxjs/internal/operators/retry';
import { tap } from 'rxjs/internal/operators/tap';
import { IEvent } from 'src/app/models/events';
import { EventsService } from 'src/app/services/events.service';
import { IonicSlides } from '@ionic/angular';
import {register} from 'swiper/element/bundle';
import {Swiper} from 'swiper/types';
import { environment } from 'src/environments/environment';
import { YaReadyEvent } from 'angular8-yandex-maps';
import { MessagesAuth } from 'src/app/enums/messages-auth';
import { ToastService } from 'src/app/services/toast.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { AuthService } from 'src/app/services/auth.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';

@Component({
  selector: 'app-event-show',
  templateUrl: './event-show.component.html',
  styleUrls: ['./event-show.component.scss'],
})
export class EventShowComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>()

  // @ViewChild('swiper')
  // swiperRef: ElementRef | undefined;
  // swiper?: Swiper;
  // swiperCurrentSlide?: number
  // swiperTotalSlids?: number

  swiperModules = [IonicSlides];

  userAuth: boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  eventId?: number
  event?: IEvent
  loadingEvent: boolean = true

  favorite: boolean = false
  loadingFavotire: boolean = false

  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0

  constructor(
    private route: ActivatedRoute, 
    private eventsService: EventsService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  
  getEvent(){
    this.eventsService.getEventById(this.eventId!).pipe(
      retry(3),
      tap(() => this.loadingEvent = false),
      takeUntil(this.destroy$)
    ).subscribe((event:any )=> { 
      if(event)
        this.event = event
        this.startLikesCount = this.event?.likes ? this.event.likes.vk_count + this.event.likes.local_count : 0
        console.log(this.event)
    }); 
  }

  checkLiked(){
    if (this.userAuth) 
      this.eventsService.checkLiked(this.eventId!).pipe(
        retry(3),
        takeUntil(this.destroy$)
      ).subscribe((liked:boolean )=> { 
        this.like = liked
        console.log('this.like ' + this.like)
      }); 
  }

  checFavorite(){
    if (this.userAuth) 
      this.eventsService.checkFavorite(this.eventId!).pipe(
        retry(3),
        takeUntil(this.destroy$)
      ).subscribe((favorite:boolean )=> { 
        this.favorite = favorite
        console.log('this.favorite ' + this.favorite)
      }); 
  }

  onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): void {
    let icoLink = this.event && this.event.types && this.event.types.length ? this.host + ':' + this.port + this.event.types[0].ico : ''

    //Создаем метку 
    target.geoObjects.add(
      new ymaps.Placemark([this.event?.latitude,this.event?.longitude],{}, {
        iconLayout: 'default#imageWithContent',
        iconContentLayout: ymaps.templateLayoutFactory.createClass(`'<div class="marker"><img src="${icoLink}"/></div>'`)
      })
    )
  }

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

  ngOnInit() {
    //Получаем ид ивента из параметра маршрута
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => { 
      this.eventId = params['id']; 
    }); 

    this.userAuth = this.authService.getAuthState()
    
    // this.favorite = this.event?.favorites_users_exists! 
    // this.like = this.event?.liked_users_exists!
    
    this.getEvent()
    this.checkLiked()
    this.checFavorite()
  }

  ngAfterViewInit(): void {
    register();
    // this.swiper = this.swiperRef?.nativeElement.swiper
    // setTimeout(() => {
    //   // this.swiperCurrentSlide = this.swiper?.realIndex! + 1
    //   // this.swiperTotalSlids =  this.swiper?.slides.length 
    //   this.swiper?.autoplay.start()
    //   ,1000
    // }) // Без этого костыля автоплей работает только в первой карточке

    // this.swiper?.on('slideChange', () => {
    //   this.swiperCurrentSlide = this.swiper?.realIndex! + 1
    // });
  }

  ngOnDestroy() {
      // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
