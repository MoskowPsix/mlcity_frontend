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
  @Input() separatorCards: IEventType[] | ISightType[] | any[] = []
  @Input() stopScroll: boolean = false
  @Input() archived: boolean = false
  @Output() endScroll: EventEmitter<any> = new EventEmitter()
  @Output() eventClicked: EventEmitter<any> = new EventEmitter()
  myEvents: boolean = false
  @Input() notFound: any = false
  public checkedRout(): void {
    this.myEvents = this.router.url === '/cabinet/events' || this.router.url === '/cabinet/sights'
  }

  eventNavigation(event: any) {
    this.eventClicked.emit(event)
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
