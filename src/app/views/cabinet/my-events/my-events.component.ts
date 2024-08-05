import { Component, OnDestroy, OnInit } from '@angular/core'
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
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
            this.events.push(...respons.events.data)
            this.spiner = false
            this.queryBuilderService.paginationPublicEventsForAuthorCurrentPage.next(respons.events.next_cursor)
            respons.events.next_cursor ? (this.nextPage = true) : (this.nextPage = false)
          }),
          tap(() => {
            this.loadEvents = true
            this.loadMoreEvents = false
          }),
          catchError((err) => {
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
        })
    }
  }
  ngOnInit() {
    this.getMyEvents()
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
