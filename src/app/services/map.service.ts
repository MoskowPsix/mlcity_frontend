import { Injectable } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { NativeGeocoder, NativeGeocoderOptions,  NativeGeocoderResult } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Capacitor } from '@capacitor/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject, Subject, takeUntil} from 'rxjs';
import { FilterService } from './filter.service';
import { NavigationService } from './navigation.service'
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly destroy$ = new Subject<void>()
  placemark!: ymaps.Placemark

  public circleCenterLatitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public circleCenterLongitude: BehaviorSubject<number> = new BehaviorSubject(0)

  public showChangeCityDialog: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public geolocationCity: BehaviorSubject<string> = new BehaviorSubject('')
  public geolocationLatitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationLongitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationRegion: BehaviorSubject<string> = new BehaviorSubject('')
  


  options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 1,
    defaultLocale: 'ru_RU'
  }
  
  constructor(
    private nativegeocoder: NativeGeocoder, 
    private locationAccuracy: LocationAccuracy, 
    private yaGeocoderService: YaGeocoderService,
    private filterService: FilterService,
    private navigationService: NavigationService,
    private locationService: LocationService,
  ) { }

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
      //console.log('Plugin geolocation not available');
      return;
    }

    if (!Capacitor.isNativePlatform())  {

      //Запускаем поиск геопозиции в вебе
      //console.log('ипользуется веб версия')
      await this.setCenterMap(map, CirclePoint) 

    } else {

      //Запускаем поиск геопозиции в мобилах
      //console.log('ипользуется мобильная версия')
      const requestPermission= await this.requestLocationPermission()

      try {
        const canRequest: boolean = await this.locationAccuracy.canRequest();
        //console.log('canrequest: ', canRequest);
        if(canRequest) {
          //Есть разрешение
          const status = await this.enableLocation();
          //console.log("стат " + status)
          if(status) {
            await this.setCenterMap(map, CirclePoint) 
          } else {
            //Если человек отказывается активировать GPS "нет,спасибо"
            let coords = await this.defaultCoords()
            this.setPlacemark(map, CirclePoint, coords!, false)
          }
        } else {
          //Если запрещен доступ GPS
          let coords = await this.defaultCoords()
          this.setPlacemark(map, CirclePoint, coords!, false)
        }
      } catch(e) {
        //console.log("Ошибка GPS " + e);
      }
    }
  }

  // Выдача запроса на включение GPS, если оно выключено
  async enableLocation() {
    try {
      const canRequest: boolean = await this.locationAccuracy.canRequest();
      //console.log('canrequest: ', canRequest);
      if(canRequest) {
        await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        //console.log('Request successful');
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
       coords = await this.defaultCoords()
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

  //поиск координат города или адреса через яндекс
  ForwardGeocoder(address: string){
    const geocodeResult = this.yaGeocoderService.geocode(address, {
      results: 1,
    });
    return geocodeResult
  }

  //Нативный поиск координат
  ForwardGeocoderNative(address: string){
    this.nativegeocoder.forwardGeocode(address, this.options)
  .then((result: NativeGeocoderResult[]) => {
    //console.log('координаты ' + result[0].latitude + ' ' + result[0].longitude)
    return [Number(result[0].latitude), Number(result[0].longitude)]
  })
  // .catch((error: any) => console.log(error));

  }

  async ReserveGeocoderNative(coords: number[]){
   await this.nativegeocoder.reverseGeocode(coords[0], coords[1], this.options)
  .then((result: NativeGeocoderResult[]) => {

    let address = result[0].administrativeArea + ', ' + result[0].locality + ', ' + result[0].thoroughfare + ', ' + result[0].subThoroughfare
    //console.log('address' + address)
    //this.searchCity(result[0].locality)
    this.searchCity(result[0].locality, result[0].administrativeArea, coords[0], coords[1])
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
      this.searchCity(firstGeoObject.getLocalities(0)[0], firstGeoObject.getAdministrativeAreas(0)[0], coords[0], coords[1])
    })
  }

  searchCity(city:string, region:string, latitude:number, longitude:number) {
    this.geolocationCity.next(city)
    this.geolocationRegion.next(region)
    this.geolocationLatitude.next(latitude)
    this.geolocationLongitude.next(longitude)

    if (!this.filterService.getLocationFromlocalStorage() ){
      this.setCoordsFromChangeCityDialog()
      //this.showChangeCityDialog.next(true)
    } else  if (this.geolocationCity.value && this.filterService.getLocationFromlocalStorage() !== this.geolocationCity.value){
      this.showChangeCityDialog.next(true)
    } 
  }
  
  //Устанавливаем дефолтные значения после подтверждения диалога на смену города
  setCoordsFromChangeCityDialog(){
    // Запрашиваем ид
    this.locationService.getLocationsWithRegion(this.geolocationCity.value, this.geolocationRegion.value).pipe().subscribe((response: any) => {
      this.filterService.setLocationTolocalStorage(response.locations.id)
    })
    //this.filterService.setLocationTolocalStorage(this.geolocationCity.value)
    //this.filterService.setLocationTolocalStorage(this.geolocationRegion.value)
    this.filterService.setLocationLatitudeTolocalStorage(this.geolocationLatitude.value.toString())
    this.filterService.setlocationLongitudeTolocalStorage(this.geolocationLongitude.value.toString())
  }

  hideChangeCityDialog(){
    this.showChangeCityDialog.next(false)
  }

  defaultCoords() {
    let cityCoords = []
    if (!this.filterService.getLocationFromlocalStorage()){
      this.filterService.setLocationTolocalStorage()
      this.filterService.setLocationLatitudeTolocalStorage()
      this.filterService.setlocationLongitudeTolocalStorage()

      cityCoords.push(parseFloat(this.filterService.locationLatitude.value), parseFloat(this.filterService.locationLongitude.value))
    } else {
      cityCoords.push(parseFloat(this.filterService.getLocationLatitudeFromlocalStorage()!), parseFloat(this.filterService.getLocationLongitudeFromlocalStorage()!))
    }
    return cityCoords
  }

  // Определяем местоположение пользователя
  async positionFilter(map: any, circlePoint: ymaps.Circle){
    //if (this.filterService.saveFilters.value === 1 || this.filterService.changeCityFilter.value) {
    //Если первый запуск приложения то устанавливаем геопозицию   
    console.log(this.filterService.changeCityFilter.value)
    if (this.navigationService.appFirstLoading.value){
      await this.geolocationMapNative(map, circlePoint)
    }  
    // Было ещё в условии: this.filterService.changeCityFilter.value && 
    //Если не первый запуск и менялся фильтр города то перекидываем на город
    if (!this.navigationService.appFirstLoading.value) {
        await circlePoint.geometry?.setCoordinates([parseFloat(this.filterService.locationLatitude.value), parseFloat(this.filterService.locationLongitude.value)])
        map.target.setBounds(circlePoint.geometry?.getBounds()!, {checkZoomRange: true})
    } 
    //ветка если юзать this.filterService.saveFilters.value === 1
    // else {
    //   await circlePoint.geometry?.setCoordinates(this.defaultCoords())
    //   map.target.setBounds(circlePoint.geometry?.getBounds()!, {checkZoomRange: true})
    // }
    this.filterService.changeCityFilter.next(false)
  }

}
