import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from '../../services/map.service';

interface Placemark {
  geometry: number[];
  // properties: ymaps.IPlacemarkProperties;
  // options: ymaps.IPlacemarkOptions;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
})
export class HomeComponent implements OnInit {

  map!:YaReadyEvent<ymaps.Map>
  placemarks: ymaps.Placemark[]=[]
  CirclePoint!: ymaps.Circle;
  // placemark: Placemark[] = [];
  minZoom = 8
  clusterer!: ymaps.Clusterer
  currentValue = 1;
  selectedRadius: number | null = null
  presentingElement: any = null;

  private points = [
    {
      "type": 'Point',
      "geometry": [56.80650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.80650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.80650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.80650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.80650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.87650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.82650785742404,61.32236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
    {
      "type": 'Point',
      "geometry": [56.80650785742404,61.82236974964705],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
        {
      "type": 'Point',
      "geometry": [56.831903, 61.911961],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
        {
      "type": 'Point',
      "geometry": [56.831903, 61.411961],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    }
  ]

  constructor(private http: HttpClient, private mapService:MapService, private yaGeocoderService: YaGeocoderService,) {}
  
  setRadius(radius: number){ 
    if (this.currentValue === radius){
      this.currentValue = 1
      this.CirclePoint.geometry?.setRadius(1000)
      this.visiblePlacemarks()
      //Zoom по размеру круга
      this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
      this.selectedRadius = null
    } else {
      this.currentValue = radius;
      this.CirclePoint.geometry?.setRadius(1000*radius)
      this.visiblePlacemarks()
      //Zoom по размеру круга
      this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
      this.selectedRadius = radius
    } 
  }

  onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): void {
    this.map={target, ymaps};
    
    // Заполняем массив меток
    this.points.forEach(element => {
      this.placemarks.push(new ymaps.Placemark(element.geometry,element.properties))
    })

    // Определяем текущее положение
    this.mapService.geolocationMap(this.map)

    // Создаем и добавляем круг
    this.CirclePoint=new ymaps.Circle([[11,11],1000*this.currentValue],{},{fillOpacity:0.15, draggable:false})
    target.geoObjects.add(this.CirclePoint)

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick',  (e) => {

      const { globalPixelCenter, zoom } = e.get('tick');
      // var current_state = this.map.target.action.getCurrentState();
      const projection = this.map.target.options.get('projection');
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom);

      this.CirclePoint.geometry?.setCoordinates(coords)
      console.log(this.CirclePoint)

      this.visiblePlacemarks()
    
    });
  }

  visiblePlacemarks(){
    //При изменении радиуса проверяем метки для показа/скрытия
    const objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).addToMap(this.map.target)
    ymaps.geoQuery(this.placemarks).remove(objectsInsideCircle).removeFromMap(this.map.target)
    // this.map.target.geoObjects.add(objectsInsideCircle.clusterize())

    // const objectsInsideCircle = ymaps.geoQuery(this.placemarks)
    // const objectsInside=objectsInsideCircle.searchInside(this.CirclePoint)
    // this.map.target.geoObjects.add(objectsInside.clusterize()
  }

  ngOnInit(): void {
    this.presentingElement = document.querySelector('.ion-page');
  }
}
