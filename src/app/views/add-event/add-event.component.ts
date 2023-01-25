import { Component, OnInit } from '@angular/core';
import { YaEvent, YaGeocoderService, YaPlacemarkDirective, YaReadyEvent } from 'angular8-yandex-maps';
import { filter } from 'rxjs';

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
  placemark!: ymaps.Placemark
  search!:string
  
  constructor(private yaGeocoderService: YaGeocoderService) {}


  onMapClick(e: YaEvent<ymaps.Map>): void {
    const { target, event } = e;

    this.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    if (this.placemark)
    {
      this.placemark.geometry?.setCoordinates(this.coords)
    }
    else
    {
      this.placemark= new ymaps.Placemark(this.coords)
      target.geoObjects.add(this.placemark)
    }
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(this.coords, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      // console.log(firstGeoObject.getAddressLine())
      this.search=firstGeoObject.getAddressLine()

    })
  }
 
  onMapBalloonOpen({ target }: YaEvent<ymaps.Map>): void {
    target.hint.close();
  }
// Поиск по улицам
  onMapReady(event: YaReadyEvent<ymaps.Map>): void {
    // const map = event.target;
    let search= new ymaps.SuggestView('search-map');
  }

  // addPlacemark(): void{
    
  //   // Декодирование координат
  //   const geocodeResult = this.yaGeocoderService.geocode('Ярославская область, Углич, улица Шаркова, 32', {
  //     results: 1,
  //   });
  //   geocodeResult.subscribe((result: any) => {
  //     const firstGeoObject = result.geoObjects.get(0);
  //      console.log(firstGeoObject.geometry.getCoordinates())
  //     // this.search=firstGeoObject.geometry.getCoordinates();
  //     result.geoObjects.add(firstGeoObject);
  //   })
  // }


  ngOnInit() {



    
  }
}
