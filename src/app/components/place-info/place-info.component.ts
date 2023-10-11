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
  date: any = {dateStart: new Date().toISOString(), dateEnd: new Date().toISOString()}


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

  changeDateRange(event: any){
    console.log(event)
    this.date.dateStart = event.dateStart
    this.date.dateEnd = event.dateEnd

  }

  normalizeDate(){
    let cur_date: Date = new Date();
    let test = this.place_date.filter((d: any)=> new Date(d.dateStart).getTime()>=cur_date.getTime())

    console.log(cur_date.getTime()>= new Date(this.place_date[300].dateStart).getTime())
    console.log(test)


  }
  
  ngOnInit() {
    this.place_date =  this.place.seances
    this.normalizeDate()
    console.log(this.place_date)
  }

}
