import { Injectable } from '@angular/core'
import { IEvent } from 'src/app/models/event'

@Injectable({
  providedIn: 'root',
})
export class EventsForSearchTapeService {
  constructor() {}
  public text: string = ''
  public cards: IEvent[] = []
}
