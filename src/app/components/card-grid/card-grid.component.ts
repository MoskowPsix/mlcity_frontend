import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IEventType } from 'src/app/models/event-type'
import { ISightType } from 'src/app/models/sight-type'
import { Router } from '@angular/router'
import { InfiniteScrollCustomEvent } from '@ionic/angular'
@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss'],
})
export class CardGridComponent implements OnInit {
  constructor(private router: Router) {}
  @Input() cards!: IEventType[] | ISightType[] | any[]
  @Input() isSight: boolean = false
  @Input() spiner!: boolean
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
  onIonInfinite(event: any) {
    let trueEvent = event as InfiniteScrollCustomEvent
    this.endScroll.emit()
    trueEvent.target.complete()
  }
  scrollPaginate() {}
  ngOnInit() {
    this.checkedRout()
  }
}
