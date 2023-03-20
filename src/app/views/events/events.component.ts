import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/events';
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { VkService } from 'src/app/services/vk.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  events: IEvent[] = []
  loadingEvents: boolean = false

  currentPage: number = 1
  //nextPage: number = 1
  totalPages: number = 1

  constructor(
    private eventsService: EventsService,
    private toastService: ToastService,
  ) { }

  getEvents(){
    this.loadingEvents = false
    this.eventsService.getLastPublish(this.currentPage).pipe(
      delay(200),
      retry(3),
      map((respons:any) => {
        this.events = respons.events.data
        this.totalPages = respons.events.last_page
      }),
      tap(() => {
        this.loadingEvents = true  
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  ngOnInit() {
    this.getEvents()
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
