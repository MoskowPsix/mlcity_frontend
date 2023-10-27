import { Component, OnInit,OnDestroy, AfterViewInit, ChangeDetectorRef, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, tap, retry, catchError, of, EMPTY, map, delay} from 'rxjs';
import { IEvent } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { IonicSlides } from '@ionic/angular';
import {register} from 'swiper/element/bundle';
import { environment } from 'src/environments/environment';
import { MessagesAuth } from 'src/app/enums/messages-auth';
import { ToastService } from 'src/app/services/toast.service';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { IPlace } from 'src/app/models/place';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { PlaceService } from 'src/app/services/place.service';
// import { Swiper } from 'swiper/types';

@Component({
  selector: 'app-event-show',
  templateUrl: './event-show.component.html',
  styleUrls: ['./event-show.component.scss'],
})
export class EventShowComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>()

  swiperModules = [IonicSlides];

  userAuth: boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  eventId?: number
  event?: IEvent
  places: any[] = []
  loadingEvent: boolean = true
  loadPlace: boolean = false

  favorite: boolean = false
  loadingFavotire: boolean = false

  like: boolean = false
  loadingLike: boolean = false
  startLikesCount: number = 0

  constructor(
    private route: ActivatedRoute, 
    private eventsService: EventsService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private queryBuilderService: QueryBuilderService,
    private placeService: PlaceService,
    
    
  ) {}

  
  getEvent(){
    this.eventsService.getEventById(this.eventId!).pipe(
      retry(3),
      tap(() => this.loadingEvent = false),
      takeUntil(this.destroy$)
    ).subscribe((event:IEvent )=> { 
      if(event)
        this.event = event
      
        this.startLikesCount = this.event?.likes ? this.event.likes.vk_count + this.event.likes.local_count : 0
    }); 
  }

  getEventPlaces(){
    this.loadPlace = true
    this.eventsService.getEventPlaces(this.eventId, this.queryBuilderService.queryBuilder('eventPlaces')).pipe(
      delay(100),
      retry(3),
      tap(() => this.loadPlace = false),
      map((response:any) => {
        this.places.push(...response.places.data)
        console.log(response)
        this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next(response.places.next_cursor)
        console.log(this.queryBuilderService.paginataionPublicEventPlacesCurrentPage)
        
      }),
      catchError((error) => {
        console.log(error)
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY)
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      
    })
  }

  setActivePlace(i: number){
    this.places[i].active = true
    console.log(this.places[i])
  }

 

  getMinPrice(prices: any[]) {
    let sort_prices = prices.sort((a, b) => a.cost_rub - b.cost_rub)
    return sort_prices[0].cost_rub
  }

  getMaxPrice(prices: any[]) {
    let sort_prices = prices.sort((a, b) => a.cost_rub - b.cost_rub)
    return sort_prices[sort_prices.length - 1].cost_rub
  }

  getUrlFrame(url:string)
  {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  checkLiked(){
    if (this.userAuth) 
      this.eventsService.checkLiked(this.eventId!).pipe(
        retry(3),
        takeUntil(this.destroy$)
      ).subscribe((liked:boolean )=> { 
        this.like = liked
      }); 
  }

  checFavorite(){
    if (this.userAuth) 
      this.eventsService.checkFavorite(this.eventId!).pipe(
        retry(3),
        takeUntil(this.destroy$)
      ).subscribe((favorite:boolean )=> { 
        this.favorite = favorite
      }); 
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
    
    this.getEventPlaces()
    this.getEvent()
    this.checkLiked()
    this.checFavorite()
    
  }

  ngAfterViewInit() {
    register()
    this.cdr.detectChanges()
    // this.swiperRef.changes.pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
    //   this.swiper = res.first.nativeElement.swiper
    //   console.log(res.first.nativeElement.swiper)
    // });

    // this.swiper?.update()
    // console.log(this.swiper)
  }

  ngOnDestroy() {
      // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
