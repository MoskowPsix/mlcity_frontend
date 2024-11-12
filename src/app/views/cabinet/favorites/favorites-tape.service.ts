import { Injectable } from '@angular/core'
import { IEvent } from 'src/app/models/event'
import { ISight } from 'src/app/models/sight'
import { AuthService } from 'src/app/services/auth.service'
@Injectable({
  providedIn: 'root',
})
export class FavoritesTapeService {
  eventsLastScrollPositionForTape: number = 0
  eventsNextPage: boolean = true
  eventsWait: boolean = false
  events: any = []

  sightsLastScrollPositionForTape: number = 0
  sightsNextPage: boolean = true
  sightsWait: boolean = false
  sights: ISight[] = []

  constructor(private authService: AuthService) {
    if (!this.authService.getAuthState()) {
      if (JSON.parse(String(localStorage.getItem('tempFavorites')))) {
        this.events = JSON.parse(String(localStorage.getItem('tempFavorites')))
      }

      if (JSON.parse(String(localStorage.getItem('tempFavoritesSights')))) {
        this.sights = JSON.parse(String(localStorage.getItem('tempFavoritesSights')))
      }
    }
  }
}
