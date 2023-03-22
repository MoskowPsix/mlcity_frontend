import { Component, OnInit } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
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
  private readonly destroy$ = new Subject<void>()
  
  map!:YaReadyEvent<ymaps.Map>
  placemarks: ymaps.Placemark[]=[]
  CirclePoint!: ymaps.Circle;
  // CirclePointSmall!: ymaps.Circle;

  myGeo!:ymaps.Placemark;
  // placemark: Placemark[] = [];
  minZoom = 1
  clusterer!: ymaps.Clusterer
  currentValue = 1;
  selectedRadius: number | null = null
  presentingElement: any = null;
  objectsInsideCircle!: any
  pixelCenter: any

  start: boolean = false
  events: any
resp:any
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

  constructor(private mapService:MapService, private eventsService:EventsService, private toastService: ToastService,) {}
  
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
    localStorage.setItem('radius', this.currentValue.toString())
  }

  onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): void {
    this.map={target, ymaps};
    // this.map.target.behaviors.disable('scrollZoom')
    // Создаем и добавляем круг
    this.CirclePoint=new ymaps.Circle([[11,11],1000*this.currentValue],{},{fillOpacity:0.15, draggable:false})
    target.geoObjects.add(this.CirclePoint)

    // this.CirclePointSmall=new ymaps.Circle([[11,11],15*this.currentValue],{},{strokeWidth: 0, fillColor:'#474A51', fillOpacity:0.4, draggable:false})
    // target.geoObjects.add(this.CirclePointSmall)

    // Определяем местоположение пользователя
    // this.mapService.geolocationMap(this.map) 
    this.mapService.geolocationMapNative(this.map, this.CirclePoint) 

    // Заполняем массив меток
    this.points.forEach(element => {
      this.placemarks.push(new ymaps.Placemark(element.geometry,element.properties))
    })
    //Создаем метку в центре круга, для перетаскивания
    // this.myGeo=new ymaps.Placemark([11,11],{},{preset: 'islands#darkBlueDotIconWithCaption',iconColor: '#0095b6'})
    this.myGeo=new ymaps.Placemark([11,11],{}, {
      iconLayout: 'default#image',
      iconImageHref:'/assets/my_geo.svg',
      iconImageSize: [60, 60],
      iconImageOffset: [-30, -55]
    })

    target.geoObjects.add(this.myGeo);

    // const subscription_1 = this.eventsService.getPublishByCoords(this.CirclePoint.geometry?.getBounds()![0], this.CirclePoint.geometry?.getBounds()![1]).subscribe((response) => {
    //   console.log(response)
    //   this.resp=response
    // })

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin',  (e) => {

      if (this.objectsInsideCircle){
        this.objectsInsideCircle.remove(this.placemarks)
      }

      if (this.start === true) {
        this.CirclePoint.geometry?.setRadius(this.currentValue*15)
        this.CirclePoint.options.set('fillOpacity', 0.7)
        this.CirclePoint.options.set('fillColor', '#474A51')
        this.CirclePoint.options.set('strokeWidth', 0)
        this.myGeo.options.set('iconImageOffset', [-30, -62])

        // this.CirclePointSmall.options.set('fillOpacity', 0.7)
        // this.CirclePointSmall.geometry?.setRadius(this.currentValue*10)

      }
      // ymaps.geoQuery(this.placemarks).removeFromMap(this.map.target)
    });

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick',  (e) => {
      // console.log('actiontick')
      // console.log(e)
      const { globalPixelCenter, zoom } = e.get('tick');
      const projection = this.map.target.options.get('projection');
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom);

      this.CirclePoint.geometry?.setCoordinates(coords)
      // this.CirclePointSmall.geometry?.setCoordinates(coords)

      this.myGeo.geometry?.setCoordinates(coords)
    });

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend',  (e) => {
      if (this.start === true) {
        this.CirclePoint.geometry?.setRadius(this.currentValue*1000)
        this.myGeo.options.set('iconImageOffset', [-30, -55])
        this.CirclePoint.options.set('fillColor', )
        this.CirclePoint.options.set('fillOpacity', 0.15)
        this.CirclePoint.options.set('strokeWidth', )
        
//         this.events = this.eventsService.getPublishByCoords(this.CirclePoint.geometry?.getBounds()![0], this.CirclePoint.geometry?.getBounds()![1])


// console.log(this.resp)

        this.getEvents()

        // console.log(this.CirclePoint.geometry?.getCoordinates())
        console.log(this.CirclePoint.geometry?.getBounds()![0])
        console.log(this.CirclePoint.geometry?.getBounds()![1])



        console.log(this.events)
        // this.CirclePointSmall.geometry?.setRadius(this.currentValue*20)
        // this.CirclePointSmall.options.set('fillOpacity', 0.4)
      } else {
        this.startSearchPoint()
      }
      this.visiblePlacemarks()
    });
  }

 async visiblePlacemarks(){
    //При изменении радиуса проверяем метки для показа/скрытия
    this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).clusterize()//.addToMap(this.map.target)//.clusterize()
    this.map.target.geoObjects.add(this.objectsInsideCircle);
    // this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).addToMap(this.map.target)
    // ymaps.geoQuery(this.placemarks).remove(this.objectsInsideCircle).removeFromMap(this.map.target)
  }

  //При запуске увеличиваем радиус до нахождения первой точки или достижения 50км
  startSearchPoint() {
    if (this.start === false) {
      while (this.points.length === 0 && this.currentValue<50) {
        this.currentValue=this.currentValue+1
        this.CirclePoint.geometry?.setRadius( this.currentValue * 1000)
      }
      this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
      localStorage.setItem('radius', this.currentValue.toString())
      this.start=true;
    }
  }

  ngOnInit(): void {
    this.presentingElement = document.querySelector('.ion-page');

  }



  getEvents(){
    // this.eventsService.getPublishByCoords([this.CirclePoint.geometry?.getBounds()![1].[0].toPrecision(6), this.CirclePoint.geometry?.getBounds()![1].[0].toPrecision(6)], this.CirclePoint.geometry?.getBounds()![0]).pipe(
    
    this.eventsService.getPublishByCoords(this.CirclePoint.geometry?.getBounds()![0], this.CirclePoint.geometry?.getBounds()![1]).pipe(
    //this.eventsService.getPublishByCoords([56.834118, 60.629022], [56.852078, 60.661794]).pipe(
      delay(200),
      retry(3),
      map((respons:any) => {
        this.events = respons.events.data
        console.log(respons)
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

}
