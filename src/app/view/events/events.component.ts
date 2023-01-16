import { EventsService } from '../../services/events.service';
import { IEvents } from '../../models/events';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  events: IEvents[]=[]

  constructor(public eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.getAll().subscribe(() => {
      // this.loading = false
    })
  }

}
