import { Injectable } from '@angular/core'
import { ISight } from 'src/app/models/sight'

@Injectable({
  providedIn: 'root',
})
export class SightForSearchService {
  constructor() {}
  public text: string = ''
  public cards: ISight[] = []
}
