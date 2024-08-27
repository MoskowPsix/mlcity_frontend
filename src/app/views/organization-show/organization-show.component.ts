import { Component, Inject, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { IOrganization } from 'src/app/models/organization'
import { OrganizationService } from 'src/app/services/organization.service'
import { environment } from 'src/environments/environment'
import { SightsService } from 'src/app/services/sights.service'
@Component({
  selector: 'app-organization-show',
  templateUrl: './organization-show.component.html',
  styleUrls: ['./organization-show.component.scss'],
})
export class OrganizationShowComponent implements OnInit {
  loading: boolean = true
  id: string = ''
  organization!: IOrganization
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
    if (this.organization.files[0] && this.organization.files[0].link.includes('https')) {
      this.avatarUrl = this.organization.files[0].link
    } else {
      this.avatarUrl = `${this.backendUrl}${this.organization.files[0].link}`
    }
  }
  getOrganization(id: string) {
    this.sightsService
      .getSightById(Number(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.organization = res
        this.checkAvatar()
        this.loading = false
      })
  }
  ngOnInit() {}
}
