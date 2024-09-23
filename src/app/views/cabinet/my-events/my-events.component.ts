import { Component, OnDestroy, OnInit } from '@angular/core'
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { Statuses } from 'src/app/enums/statuses-new'
import { EventsService } from 'src/app/services/events.service'
import { FilterService } from 'src/app/services/filter.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { ToastService } from 'src/app/services/toast.service'

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss'],
})
export class MyEventsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  constructor(
    private eventService: EventsService,
    private queryBuilderService: QueryBuilderService,
    private toastService: ToastService,
    private filterService: FilterService,
  ) {}
  nextPage: boolean = true
  events: any[] = []
  spiner: boolean = false
  loadEvents: boolean = false
  loadMoreEvents: boolean = false
  notFound!: boolean
  eventsLoadingMore() {
    this.loadMoreEvents = true
    this.getMyEvents()
  }

  getMyEvents(event?: any) {
    if (this.nextPage) {
      this.notFound = false
      this.spiner = true
      this.eventService
        .getEventsForUser(this.queryBuilderService.queryBuilder('eventsPublicForAuthor'))
        .pipe(
          delay(100),
          retry(3),
          map((respons: any) => {
            respons.events.data.forEach((event: any) => {
              if (this.checkEventStatus(event)) {
                this.events.push(event)
              }
            })
            this.spiner = false
            console.log(respons.events.next_cursor)
            this.queryBuilderService.paginationPublicEventsForAuthorCurrentPage.next(respons.events.next_cursor)
            respons.events.next_cursor ? (this.nextPage = true) : (this.nextPage = false)
          }),
          tap(() => {
            this.loadEvents = true
            this.loadMoreEvents = false
          }),
          catchError((err) => {
            console.log(err)
            this.toastService.showToast(MessagesErrors.default, 'danger')
            this.loadEvents = true
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(() => {
          if (this.events.length == 0) {
            this.notFound = true
          }
          if(this.events.length < 12  && !this.notFound){
            this.getMyEvents()
          }

        })
    }
  }
  checkEventStatus(event: any) {
    let status: any = ''
    if (event && event.statuses) {
      event.statuses.forEach((element: any) => {
        if (element.pivot.last) {
          status = element
        }
      })
      if (status.name == Statuses.draft) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.queryBuilderService.paginationPublicEventsForAuthorCurrentPage.next('')
    this.events = []
    this.nextPage = true
    this.getMyEvents()
  }
  ionViewDidWillLeave() {
    this.queryBuilderService.paginationPublicEventsForAuthorCurrentPage.next('')
  }
  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
