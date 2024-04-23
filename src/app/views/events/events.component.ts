import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import {
  catchError,
  delay,
  EMPTY,
  map,
  of,
  retry,
  Subject,
  takeUntil,
  tap,
  debounceTime,
  filter,
  last,
} from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { LocationService } from 'src/app/services/location.service';
import { register } from 'swiper/element';
import { time } from 'console';
import { throws } from 'assert';
import { Metrika } from 'ng-yandex-metrika';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';
import { IonContent } from '@ionic/angular';
import { ViewportScroller } from '@angular/common';

register();

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  @ViewChild('ContentCol') ContentCol!: ElementRef;
  @ViewChild('headerWrapper') headerWrapper!:ElementRef

  city: string = '';
  segment: string = 'eventsCitySegment';

  date: any;

  eventsCity: IEvent[] = [];
  eventsGeolocation: IEvent[] = [];

  scrollStart:any

  @ViewChild('cardContainer')
  cardContainer!: ElementRef;
  @ViewChild('widgetsContent') widgetsContent!: ElementRef;
  @ViewChild('lentEvent') lent!: ElementRef;

  loadingEventsCity: boolean = false;
  loadingEventsGeolocation: boolean = false;

  loadingMoreEventsCity: boolean = false;
  loadingMoreEventsGeolocation: boolean = false;

  currentPageEventsCity: number = 1;
  currentPageEventsGeolocation: number = 1;

  nextPage: boolean = false;

  timeStart: number = 0;
  timeEnd: number = 0;
  viewId: number[] = [];

  viewElementTimeStart: number = 0;
  viewElementTimeEnd: number = 0;

  event_id: number = 0;
  events_ids: any[] = [];
  loadTrue: boolean = false;

  eventTypeId: any;
  sightTypeId: any;

  testScrol: any = 0;

  scrollUpState: boolean = true;
  scrollCurent:any = this.viewportScroller.getScrollPosition()

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private eventService: EventsService,
    private metrika: Metrika,
    private router: Router,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
    private viewportScroller: ViewportScroller
  ) {
    this.filterService.locationId
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.locationService
          .getLocationsIds(value)
          .pipe(delay(100), retry(3), takeUntil(this.destroy$))
          .subscribe(response => {
            this.titleService.setTitle(
              'Мероприятия в городе ' + response.location.name
            );
            this.metaService.updateTag({
              name: 'description',
              content: 'Мероприятия вашего города тут',
            });
          });
      });

    let prevPath = this.location.path();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const newPath = location.path();
        this.metrika.hit(newPath, {
          referer: prevPath,
          callback: () => {},
        });
        prevPath = newPath;
      });
  }

  setDate(event: any) {
    this.filterService.setStartDateTolocalStorage(event.dateStart);
    this.filterService.setEndDateTolocalStorage(event.dateEnd);
    this.filterService.changeFilter.next(true);
  }

  scrollUp() {
    console.log(this.scrollCurent);
    document.getElementById('topEv')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollUpCheckState() {
    const boundingClientRect =
      this.widgetsContent?.nativeElement.getBoundingClientRect();
    boundingClientRect
      ? (this.scrollUpState = boundingClientRect.y > 0)
      : (this.scrollUpState = false);
  }

  getEventsCity() {
    this.loadingMoreEventsCity
      ? (this.loadingEventsCity = true)
      : (this.loadingEventsCity = false);

    this.eventsService
      .getEvents(
        this.queryBuilderService.queryBuilder('eventsPublicForCityTab')
      )
      .pipe(
        delay(100),
        retry(3),
        map((respons: any) => {
          this.eventsCity.push(...respons.events.data);
          this.filterService.setEventsCount(respons.events.total);
          this.queryBuilderService.paginationPublicEventsCityCurrentPage.next(
            respons.events.next_cursor
          );
          respons.events.next_cursor
            ? (this.nextPage = true)
            : (this.nextPage = false);
          respons.events.next_cursor
            ? (this.loadTrue = true)
            : (this.loadTrue = false);
        }),
        tap(() => {
          this.loadingEventsCity = true;
          this.loadingMoreEventsCity = false;
        }),
        catchError(err => {
          this.toastService.showToast(MessagesErrors.default, 'danger');
          this.loadingEventsCity = false;
          return of(EMPTY);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  // getEventsGeolocation(){
  //   this.loadingMoreEventsGeolocation ? this.loadingEventsGeolocation = true : this.loadingEventsGeolocation = false

  //   this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsPublicForGeolocationTab')).pipe(
  //     delay(100),
  //     retry(3),
  //     map((respons:any) => {
  //       this.eventsGeolocation.push(...respons.events.data)
  //       this.totalPagesEventsGeolocation = respons.events.last_page
  //       //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
  //     }),
  //     tap(() => {
  //       this.loadingEventsGeolocation = true
  //       this.loadingMoreEventsGeolocation = false
  //     }),
  //     catchError((err) =>{
  //       this.toastService.showToast(MessagesErrors.default, 'danger')
  //       this.loadingEventsGeolocation = false
  //       return of(EMPTY)
  //     }),
  //     takeUntil(this.destroy$)
  //   ).subscribe()
  // }

  eventsCityLoadingMore() {
    this.loadingMoreEventsCity = true;
    this.currentPageEventsCity++;
    // this.queryBuilderService.paginationPublicEventsCityCurrentPage.next(this.currentPageEventsCity)
    this.getEventsCity();
  }

  // eventsGeolocationLoadingMore(){
  //   this.loadingMoreEventsGeolocation = true
  //   this.currentPageEventsGeolocation++
  //   this.queryBuilderService.paginationPublicEventsGeolocationCurrentPage.next(this.currentPageEventsGeolocation)
  //   this.getEventsGeolocation()
  // }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  
  scrollEvent = (): void => {
    this.scrollUpCheckState();
    let viewElement: boolean = false;

    for (
      let i = 0;
      i < this.widgetsContent.nativeElement.children.length;
      i++
    ) {
      const boundingClientRect =
        this.widgetsContent.nativeElement.children[i].getBoundingClientRect();

      if (
        boundingClientRect.top >
          (window.innerHeight - (window.innerHeight + window.innerHeight)) /
            2 &&
        boundingClientRect.top < window.innerHeight / 2 &&
        !viewElement &&
        boundingClientRect.width !== 0 &&
        boundingClientRect.width !== 0
      ) {
        this.viewId.push(this.widgetsContent.nativeElement.children[i].id);

        if (this.timeStart == 0) {
          this.timeStart = new Date().getTime();
        } else {
          let time = (new Date().getTime() - this.timeStart) / 1000;

          if (time >= 3.14) {
            let id = this.viewId[this.viewId.length - 2];
            this.eventsService
              .addView(id, time)
              .pipe(
                delay(100),
                retry(1),
                catchError(err => {
                  return of(EMPTY);
                }),
                takeUntil(this.destroy$)
              )
              .subscribe();
          }

          this.timeStart = 0;

          this.timerReload();
        }
      }
    }
    viewElement = true;
  };

  carusel(status:string){
    if(status == 'hidden'){

    }
    else{

    }
  }

  timerReload() {
    this.timeStart = new Date().getTime();
  }
  eventTypesChange(typeId: any) {
    if (typeId !== 'all') {
      this.filterService.setEventTypesTolocalStorage([typeId]);
      this.filterService.changeFilter.next(true);
    } else {
      this.filterService.setEventTypesTolocalStorage([]);
      this.filterService.changeFilter.next(true);
    }
  }
//скролл
  scrollPaginate = (): void => {
    const boundingClientRect =
      this.ContentCol.nativeElement?.getBoundingClientRect();
    

      if(this.testScrol == 0){
        this.testScrol = boundingClientRect.y
        this.headerWrapper.nativeElement.style.transform = 'translateY(-10%)';
      }
      if(boundingClientRect.y > this.testScrol){
        this.headerWrapper.nativeElement.style.transform = 'translateY(-10%)';
        console.log("ScrollUp")
      }
      if(boundingClientRect.y < this.testScrol){
        this.headerWrapper.nativeElement.style.transform = 'translateY(-110%)';
      }
      else{
        
      }

      this.testScrol = boundingClientRect.y

      const lastScroll = boundingClientRect.bottom - 100
    // console.log(this.ContentCol.nativeElement.getBoundingClientRect().bottom, window.innerHeight)
    if (
      boundingClientRect.bottom <= window.innerHeight * 2 &&
      !(boundingClientRect.bottom <= window.innerHeight) &&
      this.eventsCity &&
      this.loadTrue
    ) {
      this.loadTrue = false;
      this.eventsCityLoadingMore();
    }
  };



  ngAfterViewInit(){
    this.scrollStart = this.ContentCol.nativeElement?.getBoundingClientRect()
    console.log(this.scrollStart)
  }
  ngOnInit() {
   
    window.addEventListener('scroll', this.scrollPaginate, true);
    window.addEventListener('scrollend', this.scrollEvent, true);

    this.date = {
      dateStart: this.filterService.startDate.value,
      dateEnd: this.filterService.endDate.value,
    };
    //console.log(this.date)
    this.eventsCity = [];
    this.eventsGeolocation = [];
    this.getEventsCity();
    // this.getEventsGeolocation()

    //Подписываемся на изменение фильтра
    this.filterService.changeFilter
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe(value => {
        if (value === true) {
          this.eventsCity = [];
          this.eventsGeolocation = [];
          this.getEventsCity();
          // this.getEventsGeolocation()
        }
        this.navigationService.appFirstLoading.next(false); // чтобы удалялся фильтр,
      });

    //Подписываемся на город
    // this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.locationService.getLocationsIds(value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
    //     this.city = response.location.name
    //   })
    // })
    this.filterService.eventTypes
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.eventTypeId = value[0];
      });

    // console.log(this.cardContainer)

  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }
}
