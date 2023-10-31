import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, debounceTime } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { LocationService } from 'src/app/services/location.service';
import { register } from 'swiper/element';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>()

  city: string = ''
  segment:string = 'eventsCitySegment'

  date: any

  viewElement: boolean = false
  eventsCity: IEvent[] = []
  eventsGeolocation: IEvent[] = []

  @ViewChild('cardContainer') 
  cardContainer!: ElementRef
  @ViewChild('widgetsContent') widgetsContent!: ElementRef;
  @ViewChild('test') test!: ElementRef

  loadingEventsCity: boolean = false
  loadingEventsGeolocation: boolean = false

  loadingMoreEventsCity: boolean = false
  loadingMoreEventsGeolocation: boolean = false

  currentPageEventsCity: number = 1
  currentPageEventsGeolocation: number = 1

  nextPage: boolean = false

  viewElementTimeStart: number = 0
  viewElementTimeEnd: number = 0

  event_id: number = 0
  events_ids: any[] = []

  eventTypeId: any
  sightTypeId: any

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private eventService: EventsService
  ) { }
  
  setDate(event: any) {
    this.filterService.setStartDateTolocalStorage(event.dateStart)
    this.filterService.setEndDateTolocalStorage(event.dateEnd)
    this.filterService.changeFilter.next(true)   
  }

  
 
  getEventsCity(){
    this.loadingMoreEventsCity ? this.loadingEventsCity = true : this.loadingEventsCity = false

    this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsPublicForCityTab')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        this.eventsCity.push(...respons.events.data)
        this.filterService.setEventsCount(respons.events.total)
        this.queryBuilderService.paginationPublicSightsCityCurrentPage.next(respons.events.next_cursor)
        respons.events.next_cursor ? this.nextPage = true : this.nextPage = false
      }),
      tap(() => {
        this.loadingEventsCity = true  
        this.loadingMoreEventsCity = false
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.loadingEventsCity = false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
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

  eventsCityLoadingMore(){
    this.loadingMoreEventsCity = true
    this.currentPageEventsCity++
    // this.queryBuilderService.paginationPublicEventsCityCurrentPage.next(this.currentPageEventsCity)
    this.getEventsCity()
  }

  // eventsGeolocationLoadingMore(){
  //   this.loadingMoreEventsGeolocation = true
  //   this.currentPageEventsGeolocation++
  //   this.queryBuilderService.paginationPublicEventsGeolocationCurrentPage.next(this.currentPageEventsGeolocation)
  //   this.getEventsGeolocation()
  // }

  onSegmentChanged(event: any){
    this.segment = event.detail.value
  }

  ngOnInit() {
    this.date = {dateStart: this.filterService.startDate.value, dateEnd: this.filterService.endDate.value}
    //console.log(this.date)
    this.eventsCity = []
    this.eventsGeolocation = []
    this.getEventsCity()
    // this.getEventsGeolocation()

    //Подписываемся на изменение фильтра 
    this.filterService.changeFilter.pipe(debounceTime(1000),takeUntil(this.destroy$)).subscribe((value) => {
      if (value === true){
        this.eventsCity = []
        this.eventsGeolocation = []
        this.getEventsCity()
        // this.getEventsGeolocation()
      }
      this.navigationService.appFirstLoading.next(false)// чтобы удалялся фильтр,
    })

    //Подписываемся на город
    // this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.locationService.getLocationsIds(value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
    //     this.city = response.location.name
    //   })
    // })
    this.filterService.eventTypes.pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.eventTypeId = value[0]
    });

    // console.log(this.cardContainer)
    window.addEventListener('scrollend', this.scrollEvent, true);

  }
  scrollEvent = (): void => {

    for(let i = 0; i<this.widgetsContent.nativeElement.children.length; i++){
      let viewEvent
      this.events_ids.forEach((item: any) => {
        if (item === this.widgetsContent.nativeElement.children[i].id) {
          viewEvent = true
        } else {
          viewEvent = false
        }
      })
      const boundingClientRect = this.widgetsContent.nativeElement.children[i].getBoundingClientRect()
      if(boundingClientRect.top > (window.innerHeight - (window.innerHeight + window.innerHeight))/2 && boundingClientRect.top < window.innerHeight/2  && !this.viewElement && boundingClientRect.width !== 0 && boundingClientRect.width !== 0 && !viewEvent){
        console.log(this.widgetsContent.nativeElement.children[i].id)
        if (!this.viewElementTimeStart){
          this.viewElementTimeStart = new Date().getTime()
          this.event_id = this.widgetsContent.nativeElement.children[i].id
        } 
      } else if ((this.viewElementTimeStart && !viewEvent) && (this.event_id !== this.widgetsContent.nativeElement.children[i].id) || ((this.viewElementTimeStart && !viewEvent) &&  boundingClientRect.width === 0) && (this.event_id !== this.widgetsContent.nativeElement.children[i].id)) {
        
        this.viewElementTimeEnd = new Date().getTime()
        let time: any
        time = (new Date().getTime() - this.viewElementTimeStart)/1000
        console.log(time)
        console.log(this.widgetsContent.nativeElement.children[i].id)
        if (time > 3.141) {
            console.log(this.widgetsContent.nativeElement.children[i].id)
            this.eventsService.addView(this.widgetsContent.nativeElement.children[i].id, time).pipe(
              delay(100),
              retry(3),
              map((response => {
                this.events_ids.push(this.widgetsContent.nativeElement.children[i].id)
              })),
              catchError((err) =>{
                return of(EMPTY) 
              }),
              takeUntil(this.destroy$)
            ).subscribe()
          
          // this.viewElement = true
        }
        // this.viewElementTimeStart = 0
        // this.viewElementTimeEnd = 0
      } else {
        this.viewElementTimeStart = 0
        this.viewElementTimeEnd = 0
        this.event_id = 0
      }
    } 
}
  eventTypesChange(typeId: any){
    if (typeId !== 'all') {
      this.filterService.setEventTypesTolocalStorage([typeId])
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setEventTypesTolocalStorage([])
      this.filterService.changeFilter.next(true)
    }
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
    
  }

  ngAfterViewInit(): void {
    
  }

}
