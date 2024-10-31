import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { IEvent } from 'src/app/models/event'
import { FilterService } from 'src/app/services/filter.service'
import { MapService } from 'src/app/services/map.service'
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
  ) {}
  text: string = ''
  notFound: boolean = false
  spiner: boolean = false
  cards: IEvent[] = []
  searchActive: boolean = true
  ngOnInit() {}
  ionViewWillEnter() {
    this.text = this.activatedRouter.snapshot.params['text']
    console.log(this.text)
  }
  searchNavigate(event: any) {
    this.router.navigate(['/events/search/', event])
  }
  changeSearch() {
    this.searchActive = !this.searchActive
  }

  eventNavigation(event: any) {
    this.router.navigate(['/events', event])
  }
}
