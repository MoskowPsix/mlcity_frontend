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

@Component({
  selector: 'app-event-show',
  templateUrl: './event-show.component.html',
  styleUrls: ['./event-show.component.scss'],
})
export class EventShowComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>()

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  // swiperCurrentSlide?: number
  // swiperTotalSlids?: number

  swiperModules = [IonicSlides];

  userAuth: boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  eventId?: number
  event?: IEvent
  loadingEvent: boolean = true

  constructor(private route: ActivatedRoute, private eventsService: EventsService,) { }

  
  getEvent(){
    this.eventsService.getEventById(this.eventId!).pipe(
      retry(3),
      tap(() => this.loadingEvent = false),
      takeUntil(this.destroy$)
    ).subscribe(event => { 
      if(event)
        this.event = event
    }); 
  }

  ngOnInit() {
    //Получаем ид ивента из параметра маршрута
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => { 
      this.eventId = params['id']; 
    }); 

    this.getEvent()
  }

  ngAfterViewInit(): void {
    register();
    this.swiper = this.swiperRef?.nativeElement.swiper
    setTimeout(() => {
      // this.swiperCurrentSlide = this.swiper?.realIndex! + 1
      // this.swiperTotalSlids =  this.swiper?.slides.length 
      this.swiper?.autoplay.start()
      ,1000
    }) // Без этого костыля автоплей работает только в первой карточке

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
