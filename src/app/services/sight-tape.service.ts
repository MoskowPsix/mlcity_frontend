import { Injectable } from '@angular/core'
import { IOrganization } from '../models/organization'

@Injectable({
  providedIn: 'root',
})
export class SightTapeService {
  eventsLastScrollPositionForTape: number = 0
  userHaveSubscribedEvents: boolean = false
  tapeCityName: string = ''
  nextPage: boolean = true
  sightsCity: IOrganization[] = []
  constructor() {}
}
