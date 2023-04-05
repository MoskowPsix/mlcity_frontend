import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, switchMap, takeUntil, tap, take, skip, share, concatMap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { Statuses } from 'src/app/enums/statuses';
import { IEvent } from 'src/app/models/events';
import { EventsService } from 'src/app/services/events.service';
import { MapService } from 'src/app/services/map.service';
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

  city: string = ''
  region: string = ''

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
    private userService: UserService,
    private mapService: MapService
  ) { }
  
  getUserId(){
    this.userService.getUser().pipe(
      tap((user) => user && user.id ? this.userId = user.id : this.userId = 0),
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
      city: this.city,
      region: this.region,
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
    //Получаем ид юзера и ивенты
    this.getUserId() 
    
    //Подписываемся на город и регион и вызываем ивенты
    this.mapService.city.pipe(
      tap((city) => this.city = city),
      concatMap(() => this.mapService.region),
      tap((region) => this.region = region),
      tap(() => this.events = []),
      switchMap(() => {
        //Подписываемся на регион 
         this.getEvents()
         return of(EMPTY)
      }),
      takeUntil(this.destroy$)
    ).subscribe()   
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
