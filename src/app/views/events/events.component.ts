import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, debounceTime } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  city: string = ''
  segment:string = 'eventsCitySegment'

  date: any

  eventsCity: IEvent[] = []
  eventsGeolocation: IEvent[] = []

  loadingEventsCity: boolean = false
  loadingEventsGeolocation: boolean = false

  loadingMoreEventsCity: boolean = false
  loadingMoreEventsGeolocation: boolean = false

  currentPageEventsCity: number = 1
  currentPageEventsGeolocation: number = 1

  nextPage: boolean = false

  eventTypeId: any
  sightTypeId: any

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService
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
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.locationService.getLocationsIds(value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.city = response.location.name
      })
    })
    this.filterService.eventTypes.pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.eventTypeId = value[0]
    });

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

}
