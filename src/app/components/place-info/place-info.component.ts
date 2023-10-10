import { Component, Input, OnInit } from '@angular/core';
import { YaReadyEvent } from 'angular8-yandex-maps';
import { IPlace } from 'src/app/models/place';

@Component({
  selector: 'app-place-info',
  templateUrl: './place-info.component.html',
  styleUrls: ['./place-info.component.scss'],
})
export class PlaceInfoComponent  implements OnInit {

  @Input() place!: IPlace
  place_date: any

  constructor() { }

  onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): void {
    
    //Создаем метку 
    target.geoObjects.add(
      new ymaps.Placemark([this.place?.latitude,this.place?.longitude],{}, {
        iconLayout: 'default#image',

      })
    )
  }

  dayWeek(date: any){
    
    return new Date(date).getDay()
  }
  
  ngOnInit() {
    console.log(this.place)
  }

}
