import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { UserPointService } from 'src/app/services/user-point.service'
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import { Subject, takeUntil, tap } from 'rxjs'
import { LoadingService } from 'src/app/services/loading.service'
@Component({
  selector: 'app-my-location',
  templateUrl: './my-location.page.html',
  styleUrls: ['./my-location.page.scss'],
})
export class MyLocationPage implements OnInit {
  constructor() {}
  map: any
  coords: any = [0, 0]
  userPointService: UserPointService = inject(UserPointService)
  yaGeocoderService: YaGeocoderService = inject(YaGeocoderService)
  loadingService: LoadingService = inject(LoadingService)
  placemark!: ymaps.Placemark
  address: string = 'Выберите домашний адрес'
  private readonly destroy$ = new Subject<void>()
  onMapReady(event: any) {
    this.map = event
    const search = new ymaps.SuggestView('search-map-')
    search.events.add('select', (event: any) => {
      this.map.target.geoObjects.removeAll()
      this.address = event.originalEvent.item.displayName
      let geocodeResult = this.yaGeocoderService.geocode(this.address, {
        results: 1,
      })
      geocodeResult.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
        const firstGeoObject = result.geoObjects.get(0)
        this.coords = firstGeoObject.geometry.getCoordinates()
        this.setAdress()
        this.addPlacemark(this.coords)
      })
    })
  }
  setFirstCoords() {
    this.loadingService.showLoading()
    this.userPointService
      .getPoints()
      .pipe()
      .subscribe((event: any) => {
        this.coords = []
        this.loadingService.hideLoading()
        if (event.points.data && event.points.data.length && event.points.data[0].latitude) {
          this.coords.push(Number(event.points.data[0].latitude))
          this.coords.push(Number(event.points.data[0].longitude))
          this.addPlacemark(this.coords)
          this.setAdress()
          console.log(this.coords)
        } else {
          if (localStorage.getItem('lastMapLatitude') && localStorage.getItem('lastMapLongitude')) {
            this.coords = [localStorage.getItem('lastMapLatitude'), localStorage.getItem('lastMapLongitude')]
          } else {
            this.coords = [55.75222, 37.61556]
          }
        }
      })
  }

  addPlacemark(coords: number[]) {
    this.map.target.geoObjects.removeAll()
    this.placemark = new ymaps.Placemark(coords)
    this.map.target.geoObjects.add(this.placemark)
  }

  onMapClick(e: YaEvent<ymaps.Map>) {
    const { target, event } = e
    this.map.target.geoObjects.removeAll()
    this.addPlacemark([event.get('coords')[0], event.get('coords')[1]])
    this.coords = [event.get('coords')[0], event.get('coords')[1]]
    this.setAdress()
  }

  setAdress() {
    const geocodeResult = this.yaGeocoderService.geocode(this.coords, {
      results: 1,
    })
    geocodeResult
      .pipe(
        takeUntil(this.destroy$),
        tap((result: any) => {
          const firstGeoObject = result.geoObjects.get(0)
          // this.address = firstGeoObject.getAddressLine()
          this.address = firstGeoObject.getAddressLine()
          console.log(firstGeoObject.getAddressLine())
        }),
      )
      .subscribe((result: any) => {})
  }
  saveCoords(){
    
  }
  ngOnInit() {
    this.setFirstCoords()
  }
}
