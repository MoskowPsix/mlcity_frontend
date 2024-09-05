import { Component, Inject, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { IOrganization } from 'src/app/models/organization'
import { OrganizationService } from 'src/app/services/organization.service'
import { environment } from 'src/environments/environment'
import { SightsService } from 'src/app/services/sights.service'
import { ISight } from 'src/app/models/sight'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { take } from 'lodash'
import { IEvent } from 'src/app/models/event'
@Component({
  selector: 'app-organization-show',
  templateUrl: './organization-show.component.html',
  styleUrls: ['./organization-show.component.scss'],
})
export class OrganizationShowComponent implements OnInit {
  loading: boolean = true
  id: string = ''
  sight!: ISight
  avatarUrl: string = ''
  events: IEvent[] = []
  eventsExpired: IEvent[] = []
  notFound: boolean = false
  notFoundExpired: boolean = false
  nextPage: boolean = true
  place!: any
  nextPageExpired: boolean = true
  spiner: boolean = false
  spinerExpired: boolean = false
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  private readonly destroy$ = new Subject<void>()
  constructor(
    private sightsService: SightsService,
    private router: ActivatedRoute,
    private organizationService: OrganizationService,
    private queryBuilderService: QueryBuilderService,
  ) {}
  ionViewWillEnter() {
    this.getOrganizationId()
    this.id ? this.getOrganization(this.id) : null
  }
  getOrganizationId() {
    this.id = this.router.snapshot.paramMap.get('id')!
  }
  checkAvatar() {
    if (this.sight.files![0] && this.sight.files![0].link.includes('https')) {
      this.avatarUrl = this.sight.files![0].link
    } else {
      if (this.sight.files![0]) {
        this.avatarUrl = `${this.backendUrl}${this.sight.files![0].link}`
      }
    }
  }
  getOrganizationEventsExpired() {
    if (this.nextPageExpired) {
      this.spinerExpired = true
      this.organizationService
        .getOrganizationEvents(
          String(this.sight.organization!.id),
          this.queryBuilderService.queryBuilder('eventPlacesExpired'),
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.eventsExpired.push(...res.events.data)
          res.events.next_cursor
            ? this.queryBuilderService.paginataionPublicEventPlacesExpiredCurrentPage.next(res.events.next_cursor)
            : this.queryBuilderService.paginataionPublicEventPlacesExpiredCurrentPage.next('')
          if (res.events.next_cursor == null) {
            this.nextPageExpired = false
            this.spinerExpired = false
          } else {
            this.nextPageExpired = true
            this.nextPageExpired = false
          }
          this.eventsExpired.length ? (this.notFoundExpired = false) : (this.notFoundExpired = true)
        })
    }
  }
  getOrganizationEvents() {
    if (this.nextPage) {
      this.spiner = true
      console.log(this.sight)
      this.organizationService
        .getOrganizationEvents(
          String(this.sight.organization!.id),
          this.queryBuilderService.queryBuilder('eventPlaces'),
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.events.push(...res.events.data)
          res.events.next_cursor
            ? this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next(res.events.next_cursor)
            : this.queryBuilderService.paginataionPublicEventPlacesCurrentPage.next('')
          if (res.events.next_cursor == null) {
            this.nextPage = false
            this.spiner = false
          } else {
            this.nextPage = true
            this.spiner = false
          }
          this.events.length ? (this.notFound = false) : (this.notFound = true)
        })
    }
  }
  getOrganization(id: string) {
    console.log(id)
    this.sightsService
      .getSightById(Number(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.sight = res.sight
        this.getOrganizationEvents()
        this.getOrganizationEventsExpired()
        this.checkAvatar()
        this.loading = false
        this.place = {
          address: this.sight.address,
          latitude: this.sight.latitude,
          longitude: this.sight.longitude,
        }
      })
  }
  ngOnInit() {}
}
