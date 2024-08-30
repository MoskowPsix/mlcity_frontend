import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { InfiniteScrollCustomEvent } from '@ionic/angular'
import { IEventType } from 'src/app/models/event-type'
import { IOrganization } from 'src/app/models/organization'
import { ISightType } from 'src/app/models/sight-type'

@Component({
  selector: 'app-organizations-grid',
  templateUrl: './organizations-grid.component.html',
  styleUrls: ['./organizations-grid.component.scss'],
})
export class OrganizationsGridComponent implements OnInit {
  constructor(private router: Router) {}
  @Input() cards!: IEventType[] | ISightType[] | any[]
  @Input() spiner!: boolean
  @Input() buttonType: string = ''
  @Output() endScroll: EventEmitter<any> = new EventEmitter()
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  myEvents: boolean = false
  @Input() notFound: any = false

  public checkedRout(): void {
    this.myEvents = this.router.url === '/cabinet/events' || this.router.url === '/cabinet/sights'
  }
  emitOrganization(organization: any) {
    this.selectOrganization.emit(organization)
  }
  onIonInfinite(event: any) {
    if (!this.notFound) {
      let trueEvent = event as InfiniteScrollCustomEvent
      this.endScroll.emit()
      trueEvent.target.complete()
    }
  }
  scrollPaginate() {}
  ngOnInit() {
    this.checkedRout()
  }
}
