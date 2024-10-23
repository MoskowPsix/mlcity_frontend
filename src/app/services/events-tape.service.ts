import { Injectable } from '@angular/core'
import { IEvent } from '../models/event'

@Injectable({
  providedIn: 'root',
})
export class EventsTapeService {
  eventsLastScrollPositionForTape: number = 0
  userHaveSubscribedEvents: boolean = false
  tapeCityName: string = ''
  nextPage: boolean = true
  wait: boolean = false
  eventsCity: IEvent[] = []
  constructor() {}
}
