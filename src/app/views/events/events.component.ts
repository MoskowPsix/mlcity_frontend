import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, skip, switchMap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/events';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  events: IEvent[] = []
  loadingEvents: boolean = false
  loadingMore: boolean = false

  currentPage: number = 1
  totalPages: number = 1

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
 
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService
  ) { }
  
 
  getEvents(){
    this.loadingMore ? this.loadingEvents = true : this.loadingEvents = false

    this.eventsService.getEvents(this.queryBuilderService.queryBuilder('eventsPublicForCityTab')).pipe(
      delay(200),
      retry(3),
      map((respons:any) => {
        this.events.push(...respons.events.data)
        this.totalPages = respons.events.last_page
        this.queryBuilderService.paginationPublicEventsTotalPages.next(respons.events.last_page)
      }),
      tap(() => {
        this.loadingEvents = true  
        this.loadingMore = false
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.loadingEvents = false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  loadingMoreEvents(){
    this.loadingMore = true
    this.currentPage++
    this.queryBuilderService.paginationPublicEventsCurrentPage.next(this.currentPage)
    this.getEvents()
  }

  ngOnInit() {
    this.events = []
    this.getEvents()

    //Подписываемся на изменение фильтра 
    //Пропускаем 1 skip(1) потому что, при запуске очищаются фильтры и прилетает true
    this.filterService.changeFilter.pipe(skip(1),takeUntil(this.destroy$)).subscribe((value) => {
      if (value === true){
        this.events = []
        this.getEvents()
      }
      this.navigationService.appFirstLoading.next(false)// чтобы удалялся фильтр,
    })

    //Подписываемся на город и регион и вызываем ивенты
    // this.filterService.city.pipe(
    //   tap((city) => this.city = city),
    //   concatMap(() => this.filterService.region),
    //   tap((region) => this.region = region),
    //   concatMap(() => this.mapService.radiusBoundsLats),
    //   tap((latitudeBounds) => this.latitudeBounds = latitudeBounds),
    //   concatMap(() => this.mapService.radiusBoundsLongs),
    //   tap((longitudeBounds) => this.longitudeBounds = longitudeBounds),
    //   tap(() => this.events = []),
    //   switchMap(() => {
    //      this.getEvents()
    //      return of(EMPTY)
    //   }),
    //   takeUntil(this.destroy$)
    // ).subscribe()   

  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
