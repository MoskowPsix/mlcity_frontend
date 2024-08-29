import { Component, Inject, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { IOrganization } from 'src/app/models/organization'
import { OrganizationService } from 'src/app/services/organization.service'
import { environment } from 'src/environments/environment'
import { SightsService } from 'src/app/services/sights.service'
import { ISight } from 'src/app/models/sight'
import { take } from 'lodash'
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
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  private readonly destroy$ = new Subject<void>()
  constructor(
    private sightsService: SightsService,
    private router: ActivatedRoute,
    private organizationService: OrganizationService,
  ) {}
  ionViewWillEnter() {
    this.getOrganizationId()
    this.getOrganization(this.id)
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
  getOrganizationEvents() {
    this.organizationService
      .getOrganizationEvents(String(this.sight.organization!.id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((events: any) => {
        console.log(events)
      })
  }
  getOrganization(id: string) {
    this.sightsService
      .getSightById(Number(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.sight = res
        this.getOrganizationEvents()
        console.log(this.sight)
        this.checkAvatar()
        this.loading = false
      })
  }
  ngOnInit() {}
}
