import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, skip, debounceTime } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { SightsService } from 'src/app/services/sights.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  city: string = ''
  segment:string = 'eventsCitySegment'

  eventsCity: IEvent[] = []
  eventsGeolocation: IEvent[] = []
  sightsCity: IEvent[] = []
  sightsGeolocation: IEvent[] = []

  loadingEventsCity: boolean = false
  loadingEventsGeolocation: boolean = false
  loadingSightsCity: boolean = false
  loadingSightsGeolocation: boolean = false

  loadingMoreEventsCity: boolean = false
  loadingMoreEventsGeolocation: boolean = false
  loadingMoreSightsCity: boolean = false
  loadingMoreSightsGeolocation: boolean = false

  currentPageEventsCity: number = 1
  currentPageEventsGeolocation: number = 1
  currentPageSightsCity: number = 1
  currentPageSightsGeolocation: number = 1

  totalPagesEventsCity: number = 1
  totalPagesEventsGeolocation: number = 1
  totalPagesSightsCity: number = 1
  totalPagesSightsGeolocation: number = 1

  constructor(
    private eventsService: EventsService,
    private sightsService: SightsService,
    private toastService: ToastService,
 
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService
  ) { }
  
 
  getEventsCity(){
    this.loadingMoreEventsCity ? this.loadingEventsCity = true : this.loadingEventsCity = false

    this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsPublicForCityTab')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        this.eventsCity.push(...respons.events.data)
        this.totalPagesEventsCity = respons.events.last_page
        //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
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

  getEventsGeolocation(){
    this.loadingMoreEventsGeolocation ? this.loadingEventsGeolocation = true : this.loadingEventsGeolocation = false

    this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsPublicForGeolocationTab')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        this.eventsGeolocation.push(...respons.events.data)
        this.totalPagesEventsGeolocation = respons.events.last_page
        //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
      }),
      tap(() => {
        this.loadingEventsGeolocation = true  
        this.loadingMoreEventsGeolocation = false
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.loadingEventsGeolocation = false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  getSightsCity(){
    this.loadingMoreSightsCity ? this.loadingSightsCity = true : this.loadingSightsCity = false

    this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsPublicForCityTab')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        this.sightsCity.push(...respons.sights.data)
        this.totalPagesSightsCity = respons.sights.last_page
        //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
      }),
      tap(() => {
        this.loadingSightsCity = true  
        this.loadingMoreSightsCity = false
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.loadingSightsCity = false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  getSightsGeolocation(){
    this.loadingMoreSightsGeolocation ? this.loadingSightsGeolocation = true : this.loadingSightsGeolocation = false

    this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsPublicForGeolocationTab')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        this.sightsGeolocation.push(...respons.sights.data)
        this.totalPagesSightsGeolocation = respons.sights.last_page
        //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
      }),
      tap(() => {
        this.loadingSightsGeolocation = true  
        this.loadingMoreSightsGeolocation = false
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.loadingSightsGeolocation = false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  eventsCityLoadingMore(){
    this.loadingMoreEventsCity = true
    this.currentPageEventsCity++
    this.queryBuilderService.paginationPublicEventsCityCurrentPage.next(this.currentPageEventsCity)
    this.getEventsCity()
  }

  eventsGeolocationLoadingMore(){
    this.loadingMoreEventsGeolocation = true
    this.currentPageEventsGeolocation++
    this.queryBuilderService.paginationPublicEventsGeolocationCurrentPage.next(this.currentPageEventsGeolocation)
    this.getEventsGeolocation()
  }

  sightsCityLoadingMore(){
    this.loadingMoreSightsCity = true
    this.currentPageSightsCity++
    this.queryBuilderService.paginationPublicSightsCityCurrentPage.next(this.currentPageSightsCity)
    this.getSightsCity()
  }

  sightsGeolocationLoadingMore(){
    this.loadingMoreSightsGeolocation = true
    this.currentPageSightsGeolocation++
    this.queryBuilderService.paginationPublicSightsGeolocationCurrentPage.next(this.currentPageSightsGeolocation)
    this.getSightsGeolocation()
  }

  onSegmentChanged(event: any){
    this.segment = event.detail.value
  }

  ngOnInit() {
    this.eventsCity = []
    this.eventsGeolocation = []
    this.sightsCity = []
    this.sightsGeolocation = []
    this.getEventsCity()
    this.getEventsGeolocation()
    this.getSightsCity()
    this.getSightsGeolocation()

    //Подписываемся на изменение фильтра 
    this.filterService.changeFilter.pipe(debounceTime(1000),takeUntil(this.destroy$)).subscribe((value) => {
      if (value === true){
        this.eventsCity = []
        this.eventsGeolocation = []
        this.sightsCity = []
        this.sightsGeolocation = []
        this.getEventsCity()
        this.getEventsGeolocation()
        this.getSightsCity()
        this.getSightsGeolocation()
      }
      this.navigationService.appFirstLoading.next(false)// чтобы удалялся фильтр,
    })

    //Подписываемся на город
    this.filterService.city.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.city = value
    })

  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
