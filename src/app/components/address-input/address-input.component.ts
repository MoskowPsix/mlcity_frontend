import { Component, Input, OnInit } from '@angular/core'
import { IPlace } from 'src/app/models/place'
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss'],
})
export class AddressInputComponent implements OnInit {
  constructor() {}

  @Input() control?: any
  @Input() type: string = ''
  @Input() label: string = ''
  @Input() placeholder: string = ''
  @Input() readonly: boolean = false
  @Input() openPassword: boolean = false
  @Input() invalid: boolean = false
  @Input() disabled: boolean = false
  @Input() coords!: any
  @Input() place!: IPlace
  placemark!: ymaps.Placemark
  map: any
  setCoords() {
    if (this.place.latitude) {
      this.coords = [this.place.latitude, this.place.longitude]
    
    } else {
      this.coords = [55.751574, 37.573856] // Москва по умолчанию
    }
  }
  onMapReady(event: YaReadyEvent<ymaps.Map>) {
    this.map = event
    this.addPlacemark(this.coords)
    const search = new ymaps.SuggestView('search-map-')
    search.events.add('select', () => {})

    console.log(this.map)
  }
  addPlacemark(coords: number[]) {
    this.placemark = new ymaps.Placemark(coords)
    this.map.target.geoObjects.add(this.placemark)
  }
  onMapClick(e:YaEvent<ymaps.Map>){
   const { target, event } = e
   this.map.target.geoObjects.removeAll()
   this.addPlacemark([event.get('coords')[0], event.get('coords')[1]])
   
  }
  ngOnInit() {
    this.setCoords()
    console.log(this.place)
  }
}
