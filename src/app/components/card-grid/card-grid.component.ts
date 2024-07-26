import { Component, Input, OnInit } from '@angular/core'
import { IEventType } from 'src/app/models/event-type'
import { ISightType } from 'src/app/models/sight-type'
import { Router } from '@angular/router'
@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss'],
})
export class CardGridComponent implements OnInit {
  constructor(private router: Router) {}
  @Input() cards!: IEventType[] | ISightType[] | any[]
  @Input() isSight: boolean = false
  myEvents: boolean = false
  notFound: boolean = false
  public checkedRout(): void {
    this.myEvents =
      this.router.url === '/cabinet/events' ||
      this.router.url === '/cabinet/sights'
  }
  ngOnChanges(): void {
    if (this.cards.length == 0) {
      this.notFound = true
    }
  }
  ngOnInit() {
    this.checkedRout()
  }
}
