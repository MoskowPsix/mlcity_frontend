import { Injectable } from '@angular/core'
import { IEvent } from 'src/app/models/event'
import { ISight } from 'src/app/models/sight'

@Injectable({
  providedIn: 'root',
})
export class FavoritesTapeService {
  eventsLastScrollPositionForTape: number = 0
  eventsNextPage: boolean = true
  eventsWait: boolean = false
  events: IEvent[] = []

  sightsLastScrollPositionForTape: number = 0
  sightsNextPage: boolean = true
  sightsWait: boolean = false
  sights: ISight[] = []

  constructor() {}
}
