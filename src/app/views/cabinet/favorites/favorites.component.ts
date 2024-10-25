import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { EMPTY, Subject, catchError, debounceTime, delay, map, of, retry, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { IEvent } from 'src/app/models/event'
import { ISight } from 'src/app/models/sight'
import { EventsService } from 'src/app/services/events.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { SightsService } from 'src/app/services/sights.service'
import { SwitchTypeService } from 'src/app/services/switch-type.service'
import { ToastService } from 'src/app/services/toast.service'
import { FavoritesTapeService } from './favorites-tape.service'

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

  spiner: boolean = false

  router: Router = inject(Router)
  notFound: boolean = false
  notFoundSights: boolean = true
  segment: string = 'events'
  switchTypeService: SwitchTypeService = inject(SwitchTypeService)

  loadingEvents: boolean = false
  loadingSights: boolean = false

  loadingMoreEvents: boolean = false
  loadingMoreSights: boolean = false

  nextEventsPageCount: number = 0
  nextSightsPageCount: number = 0
  favoritesTapeService: FavoritesTapeService = inject(FavoritesTapeService)

  constructor(
    private sightService: SightsService,
    private eventService: EventsService,
    private toastService: ToastService,
    private queryBuilderService: QueryBuilderService,
  ) {}

  organizationNavigation(event: any) {
    this.router.navigate(['/organizations', event])
  }
  getEvents() {
    if (this.favoritesTapeService.eventsNextPage && !this.favoritesTapeService.eventsWait) {
      if (this.favoritesTapeService.events.length > 0) {
        this.spiner = true
      }
      this.favoritesTapeService.eventsWait = true
      this.eventService
        .getEventsFavorites(this.queryBuilderService.queryBuilder('eventsFavorites'))
        .pipe(
          debounceTime(1000),
          takeUntil(this.destroy$),
          catchError((error) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            console.error(error)
            return EMPTY
          }),
        )
        .subscribe((response: any) => {
          console.log(response)
          this.spiner = false
          this.nextEventsPageCount = response.result.current_page + 1
          let lastPage = response.result.last_page
          if (this.nextEventsPageCount <= lastPage) {
            this.queryBuilderService.paginationPublicEventsFavoritesCurrentPage.next(String(this.nextEventsPageCount))
            this.favoritesTapeService.eventsNextPage = true
          } else {
            this.favoritesTapeService.eventsNextPage = false
          }
          this.favoritesTapeService.events.push(...response.result.data)
          if (this.favoritesTapeService.events.length === 0) {
            this.notFound = true
          }
          this.favoritesTapeService.eventsWait = false
        })
    }
  }

  getLastPage() {
    this.eventService
      .getEventsFavorites(this.queryBuilderService.queryBuilder('eventsFavorites'))
      .pipe()
      .subscribe((res: any) => {
        console.log(res)
      })
  }

  eventNavigation(event: any) {
    setTimeout(() => {
      this.router.navigate(['/events', event])
    }, 0)
  }
  getSights() {
    if (this.favoritesTapeService.sightsNextPage && !this.favoritesTapeService.sightsWait) {
      if (this.favoritesTapeService.sights.length > 0) {
        this.spiner = true
      }
      this.favoritesTapeService.sightsWait = true
      this.sightService
        .getSightsFavorites(this.queryBuilderService.queryBuilder('sightsFavorites'))
        .pipe(
          debounceTime(1000),
          takeUntil(this.destroy$),
          catchError((error) => {
            this.toastService.showToast(MessagesErrors.default, 'danger')
            console.error(error)
            return EMPTY
          }),
        )
        .subscribe((response: any) => {
          console.log(response)
          this.spiner = false
          this.nextSightsPageCount = response.result.current_page + 1
          let lastPage = response.result.last_page
          if (this.nextSightsPageCount <= lastPage) {
            this.queryBuilderService.paginationPublicSightsFavoritesCurrentPage.next(String(this.nextSightsPageCount))
            this.favoritesTapeService.sightsNextPage = true
          } else {
            this.favoritesTapeService.sightsNextPage = false
          }
          this.favoritesTapeService.sights.push(...response.result.data)
          if (this.favoritesTapeService.sights.length === 0) {
            this.notFoundSights = true
          }
          this.favoritesTapeService.sightsWait = false
        })
    }
  }

  eventsLoadingMore() {
    this.loadingMoreEvents = true
    this.currentPageEvents++
    this.queryBuilderService.paginationPublicEventsFavoritesCurrentPage.next(String(this.currentPageEvents))
    this.getEvents()
  }

  sightsLoadingMore() {
    this.loadingMoreSights = true
    this.currentPageSights++
    this.queryBuilderService.paginationPublicSightsFavoritesCurrentPage.next(String(this.currentPageSights))
    this.getSights()
  }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value
  }

  eventsTempClear() {
    this.nextEventsPageCount = 0
    this.notFound = false
    this.queryBuilderService.paginationPublicEventsFavoritesCurrentPage.next(String(this.nextEventsPageCount))
    this.favoritesTapeService.eventsNextPage = true
    this.favoritesTapeService.events = []
  }
  sightsTempClear() {
    this.nextSightsPageCount = 0
    this.notFoundSights = false
    this.queryBuilderService.paginationPublicSightsFavoritesCurrentPage.next(String(this.nextSightsPageCount))
    this.favoritesTapeService.sightsNextPage = true
    this.favoritesTapeService.sights = []
  }

  ionViewWillEnter() {
    this.eventsTempClear()
    this.sightsTempClear()
    this.getEvents()
    this.getSights()
    this.render()
  }
  ionViewDidLeave() {
    this.currentPageEvents = 0
    this.destroy$.next()
    this.destroy$.complete()
  }

  render() {
    this.segment = this.switchTypeService.currentType.value
  }

  ngOnInit() {}

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
