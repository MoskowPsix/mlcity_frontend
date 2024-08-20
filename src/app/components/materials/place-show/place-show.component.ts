import { Component, Input, OnInit } from '@angular/core'
import { YaReadyEvent } from 'angular8-yandex-maps'
import { IPlace } from 'src/app/models/place'

@Component({
  selector: 'app-place-show',
  templateUrl: './place-show.component.html',
  styleUrls: ['./place-show.component.scss'],
})
export class PlaceShowComponent implements OnInit {
  constructor() {}
  @Input() place!: any
  public map!: YaReadyEvent<ymaps.Map>
  onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>, place: any) {
    this.map = { target, ymaps }
    target.geoObjects.add(new ymaps.Placemark([place.latitude, place.longitude], {}, { preset: 'twirl#violetIcon' }))
    console.log(place)
    this.map.target.controls.remove('zoomControl')
    this.map.target.behaviors.disable('drag')
  }
  ngOnInit() {
    console.log(this.place)
  }
}
