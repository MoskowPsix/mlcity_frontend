import { inject, Injectable } from '@angular/core'
import { IPlace } from '../models/place'
import { FilterService } from './filter.service'
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import { LocationService } from './location.service'
import moment from 'moment'
import { Subject, takeUntil, tap } from 'rxjs'
@Injectable({
  providedIn: 'root',
})
export class SearchFirstySeanceService {
  constructor(
    private yaGeocoderService: YaGeocoderService,
    private locationService: LocationService,
  ) {}
  private readonly destroy$ = new Subject<void>()
  filterService: FilterService = inject(FilterService)
  minSeance: any
  searchSeanceForPlaces(places: IPlace[]) {
    const today = moment()
    let minSeanceTime = Infinity
    let minSeance: any
    places.forEach((place) => {
      place.seances.forEach((seance) => {
        const seanceStart = moment(seance.date_start)
        const difference = seanceStart.diff(today)
        if (difference < minSeanceTime && seanceStart > today) {
          minSeanceTime = difference
          minSeance = { seance: seance, place: place }
        }
      })
    })
    return minSeance
  }

  searchSeance(places: IPlace[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let lastMapLatitude = localStorage.getItem('lastMapLatitude')
      let lastMapLongitude = localStorage.getItem('lastMapLongitude')
      let locationName = ''
      let locationParrent = ''
      let locationPlaces: IPlace[] = [] // Здесь мы храним плейсы, которые совпали с локацией
      let minSeance: any
      let minSeancePlace
      if (lastMapLatitude && lastMapLongitude) {
        // Если есть координаты на карте
        this.locationService
          .getLocationByCoords([Number(lastMapLatitude), Number(lastMapLongitude)])
          .pipe(
            takeUntil(this.destroy$),
            tap((res: any) => {
              locationName = res.location.name
              locationParrent = res.location.location_parent.name
              places.forEach((place: any) => {
                if (
                  place.location.name &&
                  (place.location.name === locationName || place.location.name === res.location.location_parent.name)
                ) {
                  locationPlaces.push(place)
                }
              })
            }),
          )
          .subscribe({
            next: () => {
              if (locationPlaces.length != 0) {
                minSeance = this.searchSeanceForPlaces(locationPlaces)
                if (minSeance) {
                  resolve({
                    seance: minSeance.seance,
                    place: minSeance.place,
                    loacation_name: locationName,
                    location_parent: locationParrent,
                  })
                }
              } else {
                minSeance = this.searchSeanceForPlaces(places)
                if (minSeance) {
                  resolve(minSeance)
                }
              }
            },
            error: (err) => reject(err),
          })
      } else {
        minSeance = this.searchSeanceForPlaces(places)
        resolve(minSeance)
      }
    })
  }
}
