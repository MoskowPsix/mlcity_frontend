import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IEventType } from 'src/app/models/event-type';
import { ISightType } from 'src/app/models/sight-type';
import { EventTypeService } from 'src/app/services/event-type.service';
import { SightTypeService } from 'src/app/services/sight-type.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit, OnDestroy {
  host: string = environment.BASE_URL
  port: string = environment.PORT
  eventTypes: IEventType[] = []
  sightTypes: ISightType[] = []
  subscriptions: Subscription[] = []
  subscription_1: Subscription = new Subscription()
  subscription_2: Subscription = new Subscription()

  constructor(private eventTypeService: EventTypeService, private sightTypeService: SightTypeService) { }

  getEventTypes(){
    this.subscription_1 = this.eventTypeService.getTypes().subscribe((response) => {
      this.eventTypes = response.types
    })
  }

  getSightTypes(){
    this.subscription_2 = this.sightTypeService.getTypes().subscribe((response) => {
      this.sightTypes = response.types
    })
  }

  ngOnInit() {
    this.getEventTypes()
    this.getSightTypes()

    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    if (this.subscriptions) {
      this.subscriptions.forEach((subscription) => {
        if (subscription){
          subscription.unsubscribe()
        }      
      })
    }  
  }

}
