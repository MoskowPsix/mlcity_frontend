import { Injectable } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
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
  
  constructor(private nativegeocoder: NativeGeocoder, private locationAccuracy: LocationAccuracy, private yaGeocoderService: YaGeocoderService) { }

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
      this.setCenterMap(map, CirclePoint)
    } else {
      //Запускаем поиск геопозиции в мобилах
      console.log('ипользуется мобильная версия')
      const requestPermission= await this.requestLocationPermission()

      try {
        const canRequest: boolean = await this.locationAccuracy.canRequest();
        console.log('canrequest: ', canRequest);
        if(canRequest) {
          //Есть разрешение
          const stat = await this.enableLocation();
          console.log("стат " + stat)
          if(stat) {
            this.setCenterMap(map, CirclePoint) 
          } else {
            //Если человек отказывается активировать GPS "нет,спасибо"
          }
        } else {
          //Если запрещен доступ GPS
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
    const coordinates = await this.getCurrentLocation();
    this.placemark= new ymaps.Placemark([coordinates.coords.latitude,coordinates.coords.longitude], {}, {visible: false})
    // console.log(coordinates.coords.latitude,coordinates.coords.longitude)

    if (CirclePoint) {
      CirclePoint.geometry?.setCoordinates([coordinates.coords.latitude,coordinates.coords.longitude])
      map.target.setBounds(CirclePoint.geometry?.getBounds()!, {checkZoomRange:true});

      if (!Capacitor.isNativePlatform())  {
        this.ReserveGeocoder([coordinates.coords.latitude,coordinates.coords.longitude])
      } else {
        this.ReserveGeocoderNative([coordinates.coords.latitude,coordinates.coords.longitude])
      }


    } else {
      map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
      map.target.setZoom(17)
    }


    return this.placemark
  }

  //Получаем координаты
  getCurrentLocation() {
    return Geolocation.getCurrentPosition()
    .then(coordinates => {
      return coordinates;
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

    if (city === "" ) {
      localStorage.setItem('city', city)
    } else if (city != localStorage.getItem('city')) {
      //Выдаем сообщение, что возможно мы находимся в другом городе
    }
  }



  // async NativeGeocoder(coords: number[]) {

  //   this.nativegeocoder.reverseGeocode(coords[0], coords[1], this.options).then((result: NativeGeocoderResult[])=>{
  //     console.log('result = ', result)
  //     console.log('result 0 = ', result[0])

  //     this.geoAddress = this.generateAddress(result[0])
  //     this.address=result[0].administrativeArea + ' ' + result[0].subAdministrativeArea + ' ' + result[0].thoroughfare  + ' ' + result[0].subThoroughfare
  //     console.log(result[0].administrativeArea)

  //     console.log('geoAdress = ', this.geoAddress)

  //   })
  // }

  // generateAddress(addressObj: any){
  //   let obj: any = []
  //   let uniqueNames: any = []
  //   let address = ""

  //   for (let key in addressObj) {
  //     if (key != 'areasOfInterest') {
  //       obj.push(addressObj[key])
  //     }
  //   }

  //   let i = 0
  //   obj.forEach((value: any) =>{
  //     if (uniqueNames.indexOf(obj[i]) === -1) {
  //       uniqueNames.push(obj[i])
  //     }
  //     i++;
  //   })

  //   uniqueNames.reverse()
  //   for (let val in uniqueNames) {
  //     if (uniqueNames[val].lenght) {
  //       address += uniqueNames[val] + ', '
  //     }
  //   }

  //   return address.slice(0, -2)
  // }
}
