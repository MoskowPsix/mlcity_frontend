import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss'],
})
export class AddEventComponent implements OnInit {

  coords!: number[];
  placemark!: ymaps.Placemark
  search!:string
  searchForm!: FormGroup
  map!:YaReadyEvent<ymaps.Map>
  
  constructor(private yaGeocoderService: YaGeocoderService, private mapService: MapService, ) {}

//При клике ставим метку, если метка есть, то перемещаем ее
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
      this.searchForm.value.search=firstGeoObject.getAddressLine()

    })
  }
 
  // onMapBalloonOpen({ target }: YaEvent<ymaps.Map>): void {
  //   target.hint.close();
  // }

// Поиск по улицам
  onMapReady(e: YaReadyEvent<ymaps.Map>): void {
    this.map = e;
    const search= new ymaps.SuggestView('search-map');  
    this.mapService.geolocationMap(this.map);
  }


//При нажатии кнопки "Показать на карте" создает метку по адресу улицы
  addPlacemark(): void{
    
    this.searchForm.value.search=(<HTMLInputElement>document.getElementById("search-map")).value
    console.log(this.searchForm.value)

    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(this.searchForm.value.search, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);

      if (this.placemark)
      {
        this.placemark.geometry?.setCoordinates(firstGeoObject.geometry.getCoordinates())
      }
      else
      {
        this.placemark= new ymaps.Placemark(firstGeoObject.geometry.getCoordinates())
        this.map.target.geoObjects.add(this.placemark)
      }
   
    }) 
}

  ngOnInit() {
        //Создаем поля для формы
        this.searchForm = new FormGroup({
          search: new FormControl(''),
        });
  }
}