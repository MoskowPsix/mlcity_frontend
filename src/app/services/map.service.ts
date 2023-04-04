import { Injectable } from '@angular/core';
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { NativeGeocoder, NativeGeocoderOptions,  NativeGeocoderResult } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Capacitor } from '@capacitor/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  placemark!: ymaps.Placemark
  //coordinate: any
  // address: any
  // geoAddress: any;
  public city: BehaviorSubject<string> = new BehaviorSubject(this.getCityFromlocalStorage() || 'Заречный')
  public region: BehaviorSubject<string> = new BehaviorSubject('Свердловская область')
  public cityLatitude: BehaviorSubject<string> = new BehaviorSubject('56.81497464978607')
  public cityLongitude: BehaviorSubject<string> = new BehaviorSubject('61.32053375244141')
  public radius: BehaviorSubject<string> = new BehaviorSubject('1')

  public showChangeCityDialog: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public geolocationCity: BehaviorSubject<string> = new BehaviorSubject('')
  private geolocationLatitude: BehaviorSubject<number> = new BehaviorSubject(0)
  private geolocationLongitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationRegion: BehaviorSubject<string> = new BehaviorSubject('')


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

  //поиск координат города или адреса через яндекс
  ForwardGeocoder(address: string){
    const geocodeResult = this.yaGeocoderService.geocode(address, {
      results: 1,
    });
    return geocodeResult
    // return geocodeResult.subscribe((result: any) => {
    //   return result.geoObjects.get(0)
    //   // const firstGeoObject = result.geoObjects.get(0)
    //   // const cityCoords = firstGeoObject.getLocalities(0)[0]
    // }) 
  }

  //Нативный поиск координат
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
    //!!!!!!!!!!!!!!!Необходимо добавить запись координат и определение города, если город не совпадает, выдавать запрос
        this.geolocationCity.next(city)
        this.geolocationRegion.next(region)
        this.geolocationLatitude.next(latitude)
        this.geolocationLongitude.next(longitude)

        if (!this.getCityFromlocalStorage() ){
          this.setCoordsFromChangeCityDialog()
          //this.showChangeCityDialog.next(true)
        } else  if (this.getCityFromlocalStorage() !== this.geolocationCity.value){
          this.showChangeCityDialog.next(true)
        } 

  
        
        //this.setCoordsFromChangeCityDialog()
    ///////////
  }
  
  //Устанавливаем дефолтные значения после подтверждения диалога на смену города
  setCoordsFromChangeCityDialog(){
    this.setCityTolocalStorage(this.geolocationCity.value)
    this.setRegionTolocalStorage(this.geolocationRegion.value)
    this.setCityLatitudeTolocalStorage(this.geolocationLatitude.value.toString())
    this.setCityLongitudeTolocalStorage(this.geolocationLongitude.value.toString())
  }

  hideChangeCityDialog(){
    this.showChangeCityDialog.next(false)
  }

  defaultCoords() {
    let cityCoords = []
    if (!this.getCityFromlocalStorage()){
      this.setCityTolocalStorage()
      this.setRegionTolocalStorage()
      this.setCityLatitudeTolocalStorage()
      this.setCityLongitudeTolocalStorage()

      cityCoords.push(parseFloat(this.cityLatitude.value), parseFloat(this.cityLongitude.value))
    } else {
      // if (this.getCityFromlocalStorage() !== this.geolocationCity.value){
      //   this.showChangeCityDialog.next(true)
      // } 

      cityCoords.push(this.geolocationLatitude, this.geolocationLongitude)
      //cityCoords.push(parseFloat(this.getCityLatitudeFromlocalStorage()), parseFloat(this.getCityLongitudeFromlocalStorage()))
      //cityCoords = [parseFloat(localStorage.getItem('cityCoordsLatitude')!), parseFloat(localStorage.getItem('cityCoordsLongitude')!)]
      // map.target.setCenter([parseFloat(localStorage.getItem('cityCoordsLatitude')!), parseFloat(localStorage.getItem('cityCoordsLongitude')!)])
    }
    return cityCoords
  }

  setCityTolocalStorage(city: string = this.city.value){
    localStorage.setItem('city', city)
    this.city.next(city)
  }

  getCityFromlocalStorage(){
    return localStorage.getItem('city')
  }

  setRegionTolocalStorage(region:string =  this.region.value){
    localStorage.setItem('region', region)
    this.region.next(region)
  }

  getRegionFromlocalStorage(){
    return localStorage.getItem('region')
  }

  setCityLatitudeTolocalStorage(cityLatitude:string = this.cityLatitude.value){
    localStorage.setItem('cityLatitude', cityLatitude)
    this.cityLatitude.next(cityLatitude)
  }

  getCityLatitudeFromlocalStorage(){
    return localStorage.getItem('cityLatitude')
  }

  setCityLongitudeTolocalStorage(cityLongitude:string = this.cityLongitude.value){
    localStorage.setItem('cityLongitude', cityLongitude)
    this.cityLongitude.next(cityLongitude)
  }

  getCityLongitudeFromlocalStorage(){
    return localStorage.getItem('cityLongitude')
  }

  setRadiusTolocalStorage(radius:string = this.radius.value){
    localStorage.setItem('radius',radius)
    this.radius.next(radius)
  }

  getRadiusFromlocalStorage(){
    return localStorage.getItem('radius')
  }


}
