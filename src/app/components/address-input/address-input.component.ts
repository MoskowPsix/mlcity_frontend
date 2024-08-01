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
      this.addPlacemark([this.place.latitude, this.place.longitude])
    } else {
      this.coords = [55.751574, 37.573856] // Москва по умолчанию
    }
  }
  onMapReady(event: any) {
    this.map = event
    console.log(this.map)
  }
  addPlacemark(coords: number[]) {}
  ngOnInit() {
    this.setCoords()
    console.log(this.place)
  }
}
