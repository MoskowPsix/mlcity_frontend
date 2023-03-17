import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { catchError, delay, EMPTY, of, retry, Subject, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvents } from 'src/app/models/events';
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  @Input() callFromCabinet: boolean = true

  userAuth:boolean = false

  host: string = environment.BASE_URL
  port: string = environment.PORT

  events: IEvents[] = []
  loadingEvents: boolean = false
  favoriteEventsIds: number[] = []
  loadedFavoriteEventsIds: number[] = []

  starPage: number = 1
  nextPage: number = 1
  totalPages: number = 1

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  getEvents(){
    //this.loadingService.showLoading()
    this.loadingEvents = false
    this.eventsService.getLastPublish().pipe(
      delay(200),
      retry(3),
      tap((res:any) => {
        this.events = res.events.data
        this.totalPages = res.events.last_page
        this.loadingEvents = true  
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  setFavoritesIds(){
    if (this.userAuth){
      this.eventsService.setFavoritesIds().pipe(
        delay(200),
        retry(3),
        tap((res:any) => {
          this.favoriteEventsIds = res.favoriteEventsIds
        }),
        takeUntil(this.destroy$)
      ).subscribe()
    }  
  }

  checkFavorites(event_id:number){
    return this.favoriteEventsIds.includes(event_id)
  }

  toggleFavorite(event_id:number){
    this.loadedFavoriteEventsIds.push(event_id) // для отображения спинера
    this.eventsService.toggleFavorite(event_id).pipe(
      tap((res:any) => {
        this.setFavoritesIds()
        setTimeout(() => {
          this.loadedFavoriteEventsIds = this.loadedFavoriteEventsIds.filter(id => id != event_id) // убрать спинер
        }, 500)
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  checkLoadingFavorite(event_id:number){
    return this.loadedFavoriteEventsIds.includes(event_id)
  }

  ngOnInit() {
    this.userAuth = this.authService.getAuthState()
    this.setFavoritesIds()
    this.getEvents()
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
