import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { IEvent } from 'src/app/models/event'
import { FilterService } from 'src/app/services/filter.service'
import { MapService } from 'src/app/services/map.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { EventsService } from 'src/app/services/events.service'
import { promises } from 'dns'
import { finalize } from 'rxjs'
import { ToastService } from 'src/app/services/toast.service'
import { EventsForSearchTapeService } from './events-for-search-tape.service'
@Component({
  selector: 'app-events-for-search',
  templateUrl: './events-for-search.component.html',
  styleUrls: ['./events-for-search.component.scss'],
})
export class EventsForSearchComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private filterService: FilterService,
    private mapService: MapService,
    private queryBuilderService: QueryBuilderService,
    private eventsService: EventsService,
    private toastService: ToastService,
    public eventsForSearchTapeService: EventsForSearchTapeService,
  ) {}
  text: string = ''
  notFound: boolean = false
  spiner: boolean = false
  cards: IEvent[] = []
  searchActive: boolean = true
  wait: boolean = false
  nextPage: boolean = true
  ngOnInit() {}

  clearTemp() {
    this.wait = false
    this.cards = []
    this.notFound = false
    this.queryBuilderService.paginationPublicEventsForSearchCurrentPage.next('')
    this.nextPage = true
  }
  getEvents() {
    if (!this.wait && this.nextPage) {
      if (this.cards.length > 0) {
        this.spiner = true
      }
      this.wait = true
      this.eventsService
        .getEventsForSearch(this.text, this.queryBuilderService.queryBuilder('eventsForSearch'))
        .pipe(
          finalize(() => {
            if (this.cards.length === 0) {
              this.notFound = true
            }
            this.spiner = false
            this.wait = false
          }),
        )
        .subscribe((res: any) => {
          this.cards.push(...res.events.data)
          let cursor = res.events.next_cursor
          if (cursor) {
            this.queryBuilderService.paginationPublicEventsForSearchCurrentPage.next(cursor)
            this.nextPage = true
          } else {
            this.nextPage = false
          }
        })
    }
  }
  setParams() {
    return new Promise<void>((resolve) => {
      this.queryBuilderService.columns = ['name']
      this.queryBuilderService.textForSearch = this.eventsForSearchTapeService.text
      resolve()
    })
  }

  searchNavigate(event: any) {
    if (event.length >= 3) {
      this.router.navigate(['/events/search/', event])
    } else {
      this.toastService.showToast('В поле должно быть не менее 3 символов', 'warning')
    }
  }
  changeSearch() {
    this.searchActive = !this.searchActive
  }

  eventNavigation(event: any) {
    this.router.navigate(['/events', event])
  }
  ionViewWillEnter() {
    this.text = this.activatedRouter.snapshot.params['text']
    if (this.eventsForSearchTapeService.text !== this.text) {
      this.eventsForSearchTapeService.text = this.text
      this.clearTemp()
      this.setParams().then(() => {
        this.getEvents()
      })
    }
  }
  ionViewDidLeave() {}
}
