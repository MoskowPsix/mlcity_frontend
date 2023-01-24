import { Component, OnInit } from '@angular/core';
import { YaEvent, YaPlacemarkDirective } from 'angular8-yandex-maps';

interface Placemark {
  geometry: number[];
  properties: ymaps.IPlacemarkProperties;
  options: ymaps.IPlacemarkOptions;
}

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss'],
})
export class AddEventComponent implements OnInit {

  coords!: number[];

  onMapClick(e: YaEvent<ymaps.Map>): void {
    const { target, event } = e;

    this.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    let placemark= new ymaps.Placemark(this.coords)
    target.geoObjects.removeAll()
    target.geoObjects.add(placemark)

    // if (!target.balloon.isOpen()) {
      // const coords = event.get('coords');
      // target.options.set('present','islands#greenDotIcon')
      // this.coord=coords

      // target.balloon.open(this.coords, {
      //   contentBody:
      //     '<p>Текущие координаты: ' +
      //     [this.coords[0].toPrecision(6), this.coords[1].toPrecision(6)].join(', ') +
      //     '</p>',
      // });
    // } else {
    //   target.balloon.close();
    // }
  }

  // onMapContextMenu({ target, event }: YaEvent<ymaps.Map>): void {
  //   target.hint.open(event.get('coords'), 'Someone right-clicked');
  // }
 
  onMapBalloonOpen({ target }: YaEvent<ymaps.Map>): void {
    target.hint.close();
  }

  constructor() { }

  ngOnInit() {}
}
