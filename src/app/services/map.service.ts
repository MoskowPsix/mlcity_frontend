import { Injectable } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { environment } from '../../environments/environment';
import { NativeGeocoder, NativeGeocoderOptions,  NativeGeocoderResult } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Capacitor } from '@capacitor/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  placemark!: ymaps.Placemark
  coordinate: any
  address: any
  geoAddress: any;

  options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 1,
    defaultLocale: 'ru_RU'
  }
  
  constructor(
    private nativegeocoder: NativeGeocoder, 
    private locationAccuracy: LocationAccuracy, 
    private yaGeocoderService: YaGeocoderService) { }

  //Определение геопозиции с помощью яндекса (платно)
  geolocationMap(event: YaReadyEvent<ymaps.Map>): void{
    ymaps.geolocation
    .get({
      provider: 'browser',
      mapStateAutoApply: true,
    })
    .then((result) => {
      result.geoObjects.options.set('visible', false);
      event.target.geoObjects.add(result.geoObjects);
    });
  }

   //Определение геопозиции нативными способами платформы
   async geolocationMapNative(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle) {

    if (!Capacitor.isPluginAvailable('Geolocation')) {
      console.log('Plugin geolocation not available');
      return;
    }

    if (!Capacitor.isNativePlatform())  {

      //Запускаем поиск геопозиции в вебе
      console.log('ипользуется веб версия')
      await this.setCenterMap(map, CirclePoint) 

    } else {

      //Запускаем поиск геопозиции в мобилах
      console.log('ипользуется мобильная версия')
      const requestPermission= await this.requestLocationPermission()

      try {
        const canRequest: boolean = await this.locationAccuracy.canRequest();
        console.log('canrequest: ', canRequest);
        if(canRequest) {
          //Есть разрешение
          const status = await this.enableLocation();
          console.log("стат " + status)
          if(status) {
            await this.setCenterMap(map, CirclePoint) 
          } else {
            //Если человек отказывается активировать GPS "нет,спасибо"
            let coords= await this.defaultCoords()
            this.setPlacemark(map, CirclePoint, coords!, false)
          }
        } else {
          //Если запрещен доступ GPS
          let coords= await this.defaultCoords()
          this.setPlacemark(map, CirclePoint, coords!, false)
        }
      } catch(e) {
        console.log("Ошибка GPS " + e);
      }
    }
  }

  // Выдача запроса на включение GPS, если оно выключено
  async enableLocation() {
    try {
      const canRequest: boolean = await this.locationAccuracy.canRequest();
      console.log('canrequest: ', canRequest);
      if(canRequest) {
        await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        console.log('Request successful');
        return true;
      } else { return false;}
    } catch(e) {
      return false;
    }
  }

  //Определяем местоположение и перемещаем карту
  async setCenterMap(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle) {
    let coords
    try {
       coords = await this.getCurrentLocation();
       this.setPlacemark(map, CirclePoint, coords!, true)

    } catch (error) {
       coords= await this.defaultCoords()
       this.setPlacemark(map, CirclePoint, coords!, false)
    }
    return coords
  }

  setPlacemark(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle, coords?:any, gps?:boolean) {
    this.placemark= new ymaps.Placemark(coords, {}, {visible: false})

    if (CirclePoint) {
      CirclePoint.geometry?.setCoordinates(coords)
      map.target.setBounds(CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});

      if (gps) {
        if (!Capacitor.isNativePlatform())  {
          this.ReserveGeocoder(coords)
        } else {
          this.ReserveGeocoderNative(coords)
        }
      }

    } else {
      map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
      map.target.setZoom(17)
    }
  }

  //Получаем координаты
  getCurrentLocation() {
    return Geolocation.getCurrentPosition()
    .then(coordinates => {
      return [coordinates.coords.latitude, coordinates.coords.longitude];
    })
    .catch(e => {
      throw(e);
    });
  }

  //Проверка разрешений на GPS
  async requestLocationPermission() {
    return Geolocation.requestPermissions()
    .then(status => {
      return status.location;
    })
    .catch(e => {
      return 'prompt-with-rationale';
    });
  }

  ForwardGeocoderNative(address: string){
    this.nativegeocoder.forwardGeocode(address, this.options)
  .then((result: NativeGeocoderResult[]) => {
    console.log('координаты ' + result[0].latitude + ' ' + result[0].longitude)
    return [Number(result[0].latitude), Number(result[0].longitude)]
  })
  // .catch((error: any) => console.log(error));

  }

  async ReserveGeocoderNative(coords: number[]){
   await this.nativegeocoder.reverseGeocode(coords[0], coords[1], this.options)
  .then((result: NativeGeocoderResult[]) => {

    let address = result[0].administrativeArea + ', ' + result[0].locality + ', ' + result[0].thoroughfare + ', ' + result[0].subThoroughfare
    console.log('address' + address)
    this.searchCity(result[0].locality)
    return address
  })
  .catch((error: any) => console.log(error));

  }

  async ReserveGeocoder(coords: number[]) {
    // Декодирование координат
    const geocodeResult = await this.yaGeocoderService.geocode(coords, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      this.searchCity(firstGeoObject.getLocalities(0)[0])
    })
  }

  searchCity(city: string) {
    //!!!!!!!!!!!!!!!Необходимо добавить запись координат и определение города, если город не совпадает, выдавать запрос
   
      if (city != localStorage.getItem('cityName')) {
        console.log("")
      }

 
    ///////////
  }
  

  defaultCoords() {
    let cityCoords
    if (!localStorage.getItem('cityName'))
    {
      localStorage.setItem('cityName',environment.cityName)
      localStorage.setItem('cityRegion',environment.cityRegion)
      localStorage.setItem('cityCoordsLatitude',environment.cityCoordsLatitude.toString())
      localStorage.setItem('cityCoordsLongitude',environment.cityCoordsLongitude.toString())

      // map.target.setCenter([environment.cityCoordsLatitude, environment.cityCoordsLongitude]);
      cityCoords=[environment.cityCoordsLatitude, environment.cityCoordsLongitude]
      
    } else {
      cityCoords = [parseFloat(localStorage.getItem('cityCoordsLatitude')!), parseFloat(localStorage.getItem('cityCoordsLongitude')!)]
      // map.target.setCenter([parseFloat(localStorage.getItem('cityCoordsLatitude')!), parseFloat(localStorage.getItem('cityCoordsLongitude')!)])
    }
    return cityCoords
  }


}
