import { Component, OnInit } from '@angular/core';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/event';
import { ISight } from 'src/app/models/sight';
import { EventsService } from 'src/app/services/events.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { SightsService } from 'src/app/services/sights.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()

  events: IEvent[] = []
  sights: ISight[] = []

  totalPagesSights: number = 1
  totalPagesEvents: number = 1

  currentPageEvents: number = 1
  currentPageSights: number = 1

  segment:string = 'events'

  loadingEvents: boolean = false
  loadingSights: boolean = false

  loadingMoreEvents: boolean = false
  loadingMoreSights: boolean = false


  constructor(
    private sightService: SightsService,
    private eventService: EventsService,
    private toastService: ToastService,
    private queryBuilderService: QueryBuilderService,
    ) { }

  getEvents() {
    this.loadingMoreEvents ? this.loadingEvents = true : this.loadingEvents = false
    this.eventService.getEventsFavorites(this.queryBuilderService.queryBuilder('eventsFavorites')).pipe(
      delay(100),
      retry(3),
      tap(() => {
        this.loadingEvents = true 
        this.loadingMoreEvents = false
      }),
      catchError((err) =>{
        //console.log(err)
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe((response: any) =>{
      this.totalPagesEvents = response.result.last_page
      this.events.push(...response.result.data) 
    })
  }

    getSights() {
      this.loadingMoreSights ? this.loadingSights = true : this.loadingSights = false
      this.sightService.getSightsFavorites(this.queryBuilderService.queryBuilder('sightsFavorites')).pipe(  
        delay(100),
        retry(3),
        tap(() => {
          this.loadingSights = true 
          this.loadingMoreSights = false
        }),
        catchError((err) =>{
          //console.log(err)
          this.toastService.showToast(MessagesErrors.default, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe((response: any) =>{
        this.totalPagesSights = response.result.last_page
        this.sights.push(...response.result.data)  
      })
    }

    eventsLoadingMore(){
      this.loadingMoreEvents = true
      this.currentPageEvents++
      // this.queryBuilderService.paginationPublicEventsFavoritesCurrentPage.next(this.currentPageEvents)
      this.getEvents()
    }

    sightsLoadingMore(){
      this.loadingMoreSights = true
      this.currentPageSights++
      // this.queryBuilderService.paginationPublicSightsFavoritesCurrentPage.next(this.currentPageSights)
      this.getSights()
    }

  onSegmentChanged(event: any){
    this.segment = event.detail.value
  }

  ngOnInit() {
    this.getEvents()
    this.getSights()
  }
  ngOnDestroy(){
    this.destroy$.next()
    this.destroy$.complete()
  }
}

