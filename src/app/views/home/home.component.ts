import { Component, OnInit } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import {catchError,delay,EMPTY,map,of,Subject,switchMap,takeUntil,tap} from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { Statuses } from 'src/app/enums/statuses';
import { IGetEventsAndSights } from 'src/app/models/getEventsAndSights';
import { EventsService } from 'src/app/services/events.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { MapService } from '../../services/map.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
})
export class HomeComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  private userId: number = 0
  
  map!:YaReadyEvent<ymaps.Map>
  placemarks: ymaps.Placemark[]=[]
  CirclePoint!: ymaps.Circle;
  // CirclePointSmall!: ymaps.Circle;

  myGeo!:ymaps.Placemark;
  minZoom = 8
  clusterer!: ymaps.Clusterer
  currentValue = 1;
  radius:number = 1
  //selectedRadius: number | null = null
  //presentingElement: any = null;
  objectsInsideCircle!: any
  pixelCenter: any

  queryParams?: IGetEventsAndSights 
  cityCoords!: number[]

  firstStart: boolean = true
  
  // linkPhoto:string=''

  constructor(
    private mapService:MapService, 
    private eventsService:EventsService, 
    private toastService: ToastService,
    private userService: UserService) {}
  
  setRadius(radius: number){ 

    if (this.currentValue === radius){
      this.currentValue = 1
      this.CirclePoint.geometry?.setRadius(1000)
      //Zoom по размеру круга
    } else {
      this.currentValue = radius;
      this.CirclePoint.geometry?.setRadius(1000*radius)
      //Zoom по размеру круга
    } 
    this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
    //this.selectedRadius = radius
    //localStorage.setItem('radius', this.currentValue.toString())
    this.mapService.setRadiusTolocalStorage(this.currentValue.toString())
    this.mapService.radius.next(this.currentValue.toString())
  }

  async onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>): Promise<void> {
    this.map={target, ymaps};

    // Создаем и добавляем круг
    this.CirclePoint=new ymaps.Circle([[11,11],1000*this.currentValue],{},{fillOpacity:0.15, draggable:false})
    target.geoObjects.add(this.CirclePoint)

    // Определяем местоположение пользователя
    await this.mapService.geolocationMapNative(this.map, this.CirclePoint) 

    //Создаем метку в центре круга, для перетаскивания
    this.myGeo=new ymaps.Placemark([11,11],{}, {
      iconLayout: 'default#image',
      iconImageHref:'/assets/my_geo.svg',
      iconImageSize: [60, 60],
      iconImageOffset: [-30, -55]
    })

    target.geoObjects.add(this.myGeo);
    
    console.log(this.firstStart)
    if (this.firstStart === true) {
      this.getEvents()
    }

    // Вешаем на карту событие начала перетаскивания
    this.map.target.events.add('actionbegin',  (e) => {
      console.log('actionbegin')

      if (this.objectsInsideCircle){
        this.map.target.geoObjects.remove(this.objectsInsideCircle)

        this.objectsInsideCircle.remove(this.placemarks)
      this.placemarks=[]
      }

      if (this.firstStart === false) {
        this.CirclePoint.geometry?.setRadius(this.currentValue*15)
        this.CirclePoint.options.set('fillOpacity', 0.7)
        this.CirclePoint.options.set('fillColor', '#474A51')
        this.CirclePoint.options.set('strokeWidth', 0)
        this.myGeo.options.set('iconImageOffset', [-30, -62])
      }
    });

    // Вешаем на карту событие по перетаскиванию круга и отображения меток в круге
    this.map.target.events.add('actiontick',  (e) => {
      console.log('actiontick')

      const { globalPixelCenter, zoom } = e.get('tick');
      const projection = this.map.target.options.get('projection');
      const coords = projection.fromGlobalPixels(globalPixelCenter, zoom);

      this.CirclePoint.geometry?.setCoordinates(coords)

      this.myGeo.geometry?.setCoordinates(coords)

    });

    // Вешаем на карту событие по окончинию перетаскивания
    this.map.target.events.add('actionend',  async (e) => {
      console.log('actionend')

      if (this.firstStart === false) {
        this.CirclePoint.geometry?.setRadius(this.currentValue*1000)
        this.myGeo.options.set('iconImageOffset', [-30, -55])
        this.CirclePoint.options.set('fillColor', )
        this.CirclePoint.options.set('fillOpacity', 0.15)
        this.CirclePoint.options.set('strokeWidth', )
        
        this.getEvents()
      }

    });
  }

  visiblePlacemarks(){
  
    //При изменении радиуса проверяем метки для показа/скрытия
    this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).clusterize()//.addToMap(this.map.target)//.clusterize()
    this.map.target.geoObjects.add(this.objectsInsideCircle);
    // this.objectsInsideCircle = ymaps.geoQuery(this.placemarks).searchInside(this.CirclePoint).addToMap(this.map.target)
    // ymaps.geoQuery(this.placemarks).remove(this.objectsInsideCircle).removeFromMap(this.map.target)
  }

  ngOnInit(): void {
    //this.presentingElement = document.querySelector('.ion-page');
    // if (localStorage.getItem('radius')) {
    //   this.currentValue=parseInt(localStorage.getItem('radius')!)
    // }
     //Подписываемся на изменение радиуса
     this.mapService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value)
    });
  }

  getUserId(){
    this.userService.getUser().pipe(
      tap((user) => user && user.id ? this.userId = user.id : this.userId = 0),
      switchMap(() => {
         this.getEvents()
         return of(EMPTY) 
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }


  getEvents() {

    this.queryParams =  {
      statuses: [Statuses.publish].join(','),
      statusLast: true,
      latitude: this.CirclePoint.geometry?.getBounds()![0].join(','),
      longitude: this.CirclePoint.geometry?.getBounds()![1].join(',')
    }


    this.eventsService.getEvents(this.queryParams).pipe(
      delay(100),
      map((respons:any) => {

        if (respons.events)
        {
          if (this.objectsInsideCircle){
            this.map.target.geoObjects.remove(this.objectsInsideCircle)
    
            this.objectsInsideCircle.remove(this.placemarks)
          this.placemarks=[]
          }

          respons.events.forEach( (point: any) => {

            console.log(point)
            const filesLink = JSON.parse(JSON.stringify(point.files)).map((file:any) => {
              return file.link;
            });
            
            let linkPhoto=''
            filesLink.forEach((file: any) => {
              if (!file.includes('https://') && !file.includes('https://')) {
                file=environment.BACKEND_URL + ":" + environment.BACKEND_PORT  + file
              }
              linkPhoto+=`<img max-width="200" max-height="200" src="${file}"/>`
            });
            // console.log(filesSizes)
  
            this.placemarks.push(new ymaps.Placemark([point.latitude, point.longitude],{
              balloonContentHeader:point.name,
              balloonContent: linkPhoto + point.description, 
              balloonLayout: "default#imageWithContent"}, {      
              }))
        });
        }

          if ((!respons.events.length && this.currentValue<50)) {

            this.currentValue=this.currentValue+1
            this.CirclePoint.geometry?.setRadius( this.currentValue * 1000)
            this.mapService.radius.next(this.currentValue.toString())
             this.getEvents()
             this.map.target.setBounds(this.CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});
             
  
            console.log(this.currentValue)
            console.log(respons )
          } else {
            this.firstStart=false
          }

      this.visiblePlacemarks()

      }),

      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.firstStart=false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

}
