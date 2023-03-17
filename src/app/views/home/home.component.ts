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
  myGeo!:ymaps.Placemark;
  // placemark: Placemark[] = [];
  minZoom = 1
  clusterer!: ymaps.Clusterer
  currentValue = 1;
  selectedRadius: number | null = null
  presentingElement: any = null;
  objectsInsideCircle!: any

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
    },
    {
      "type": 'Point',
      "geometry": [55.7361312, 37.6777025],
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
      "geometry": [55.7361312, 37.6777025],
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
      "geometry": [55.7361312, 37.6777025],
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
      "geometry": [55.7361312, 37.6777025],
      "properties": {
        "balloonContentBody":"Тестовая запись"
      },
      "options":{
        "preset": "",
        "iconColor": "",
      },
    },
  ]

  constructor(private mapService:MapService) {}
  
  setRadius(radius: number){ 

    if (this.currentValue === radius){
      this.currentValue = 1
      this.CirclePoint.geometry?.setRadius(1000)
      this.objectsInsideCircle.remove(this.placemarks)
      this.visiblePlacemarks()
      //Zoom по размеру круга
      this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
      this.selectedRadius = null
    } else {
      this.currentValue = radius;
      this.CirclePoint.geometry?.setRadius(1000*radius)
      this.objectsInsideCircle.remove(this.placemarks)
      this.visiblePlacemarks()
      //Zoom по размеру круга
      this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
      this.selectedRadius = radius
    } 
  }

  onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): void {
    this.map={target, ymaps};

    // Создаем и добавляем круг
    this.CirclePoint=new ymaps.Circle([[11,11],1000*this.currentValue],{},{fillOpacity:0.15, draggable:false})
    target.geoObjects.add(this.CirclePoint)

    // Определяем местоположение пользователя
    // this.mapService.geolocationMap(this.map) 
    this.mapService.geolocationMapNative(this.map, this.CirclePoint) 

    // Заполняем массив меток
    this.points.forEach(element => {
      this.placemarks.push(new ymaps.Placemark(element.geometry,element.properties))
    })

    //Создаем метку в центре круга, для перетаскивания
    this.myGeo=new ymaps.Placemark([11,11],{},{preset: 'islands#darkBlueDotIconWithCaption',iconColor: '#0095b6'})
    target.geoObjects.add(this.myGeo);

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin',  (e) => {

      if (this.objectsInsideCircle){
        this.objectsInsideCircle.remove(this.placemarks)
      }
      // console.log(this.objectsInsideCircle)
    
      this.CirclePoint.geometry?.setRadius(10)
      // ymaps.geoQuery(this.placemarks).removeFromMap(this.map.target)
    });

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick',  (e) => {

      const { globalPixelCenter, zoom } = e.get('tick');
      const projection = this.map.target.options.get('projection');
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom);

      this.CirclePoint.geometry?.setCoordinates(coords)
      this.myGeo.geometry?.setCoordinates(coords)
    
    });

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend',  (e) => {
      this.CirclePoint.geometry?.setRadius(this.currentValue*1000)
      this.visiblePlacemarks()
    });
  }

 async visiblePlacemarks(){
    //При изменении радиуса проверяем метки для показа/скрытия
      this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).clusterize()//.addToMap(this.map.target)//.clusterize()
      this.map.target.geoObjects.add(this.objectsInsideCircle);
    //  this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).addToMap(this.map.target)
    // ymaps.geoQuery(this.placemarks).remove(this.objectsInsideCircle).removeFromMap(this.map.target)
  }

  ngOnInit(): void {
    this.presentingElement = document.querySelector('.ion-page');
  }

}
