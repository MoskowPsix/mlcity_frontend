import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, Observable, of, retry, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { Statuses } from 'src/app/enums/statuses';
import { IEvent } from 'src/app/models/events';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { IGetEventsAndSights } from '../../models/getEventsAndSights';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  private userId: number = 0

  events: IEvent[] = []
  loadingEvents: boolean = false
  loadingMore: boolean = false

  currentPage: number = 1
  //nextPage: number = 1
  totalPages: number = 1

  queryParams?: IGetEventsAndSights 

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
    private userService: UserService
  ) { }
  
  getUserId(){
    this.userService.getUser().pipe(
      tap((user) => user && user.id ? this.userId = user.id : this.userId = 0),
      switchMap(() => {
         this.getEvents()
         return of(EMPTY) 
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }
 

  getEvents(){
    this.queryParams =  {
      pagination: true,
      page: this.currentPage,
      userId: this.userId,
      favoriteUser: true,
      likedUser: true,
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      city: 'Заречный',
      //latitude: [50.84330000000000,70.84330000000000].join(','),
      //longitude:[50.84330000000000,70.84330000000000].join(',')
    }
    this.loadingMore ? this.loadingEvents = true : this.loadingEvents = false
    this.eventsService.getEvents(this.queryParams).pipe(
      delay(200),
      retry(3),
      map((respons:any) => {
        this.events.push(...respons.events.data)
        this.totalPages = respons.events.last_page
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
    this.getEvents()
  }

  ngOnInit() {
    this.getUserId()
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
