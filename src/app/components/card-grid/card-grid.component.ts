import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IEventType } from 'src/app/models/event-type'
import { ISightType } from 'src/app/models/sight-type'
import { Router } from '@angular/router'
import { InfiniteScrollCustomEvent } from '@ionic/angular'
import { Statuses } from 'src/app/enums/statuses-new'
@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss'],
})
export class CardGridComponent implements OnInit {
  constructor(private router: Router) {}
  @Input() cards: IEventType[] | ISightType[] | any[] = []
  @Input() isSight: boolean = false
  @Input() spiner!: boolean
  @Input() archived: boolean = false
  @Output() endScroll: EventEmitter<any> = new EventEmitter()
  myEvents: boolean = false
  @Input() notFound: any = false
  public checkedRout(): void {
    this.myEvents = this.router.url === '/cabinet/events' || this.router.url === '/cabinet/sights'
  }
  ngOnChanges(): void {
    // if (this.cards.length != 0) {
    //   this.notFound = true
    // } else {
    //   this.notFound = 'notfound'
    // }
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
