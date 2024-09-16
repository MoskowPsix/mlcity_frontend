import { Injectable } from '@angular/core'
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import {
  NativeGeocoder,
  NativeGeocoderOptions,
  NativeGeocoderResult,
} from '@awesome-cordova-plugins/native-geocoder/ngx'
import { Capacitor } from '@capacitor/core'
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx'
import { Geolocation } from '@capacitor/geolocation'
import { BehaviorSubject, catchError, EMPTY, of, Subject, takeUntil } from 'rxjs'
import { FilterService } from './filter.service'
import { NavigationService } from './navigation.service'
import { LocationService } from './location.service'
import { ToastService } from './toast.service'

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly destroy$ = new Subject<void>()
  placemark?: ymaps.Placemark

  public circleCenterLatitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public circleCenterLongitude: BehaviorSubject<number> = new BehaviorSubject(0)

  public showChangeCityDialog: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public geolocationCity: BehaviorSubject<string> = new BehaviorSubject('')
  public zoom: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationLatitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationLongitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationRegion: BehaviorSubject<string> = new BehaviorSubject('')

  options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 1,
    defaultLocale: 'ru_RU',
  }

  constructor(
    private nativegeocoder: NativeGeocoder,
    private locationAccuracy: LocationAccuracy,
    private yaGeocoderService: YaGeocoderService,
    private filterService: FilterService,
    private navigationService: NavigationService,
    private locationService: LocationService,
    private toastService: ToastService,
  ) { }

  //Определение геопозиции с помощью яндекса (платно)
  geolocationMap(event: YaReadyEvent<ymaps.Map>): void {
    ymaps.geolocation
      .get({
        provider: 'browser',
        mapStateAutoApply: true,
      })
      .then((result) => {
        result.geoObjects.options.set('visible', false)
        event.target.geoObjects.add(result.geoObjects)
      })
  }

  setZoom(zoom:number){
    this.zoom.next(zoom)
    localStorage.setItem('zoom',String(zoom))
  }
  getZoomFromLocalStorage(){
    return localStorage.getItem('zoom')
  }
  //Определение геопозиции нативными способами платформы
  async geolocationMapNative(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle) {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      // await this.setCenterMap(map, CirclePoint);
      return
    }

    if (!Capacitor.isNativePlatform()) {
      //Запускаем поиск геопозиции в вебе
      await this.setCenterMap(map, CirclePoint)
    } else {
      //Запускаем поиск геопозиции в мобилах
      //console.log('ипользуется мобильная версия')
      const status = await this.requestLocationPermission()
      try {
        if (status == 'granted') {
          await this.setCenterMap(map, CirclePoint)
        } else {
          //Если запрещен доступ GPS
          let coords = await this.defaultCoords()
          // console.log("2, " + coords)
          // await this.setCenterMap(map, CirclePoint);
          await this.setPlacemark(map, CirclePoint, coords!, false)
        }
      } catch (e) {
        console.log('Ошибка GPS ' + e, 'warning')
      }
    }
  }

  // Выдача запроса на включение GPS, если оно выключено
  async enableLocation() {
    try {
      const canRequest: boolean = await this.locationAccuracy.canRequest()
      //console.log('canrequest: ', canRequest);
      if (canRequest) {
        await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
        //console.log('Request successful');
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }

  setLastMapCoordsToLocalStorage(lat: any, long: any) {
    localStorage.setItem('lastMapLatitude', lat)
    localStorage.setItem('lastMapLongitude', long)
    this.geolocationLatitude.next(lat)
    this.geolocationLongitude.next(long)
  }

  getLastMapCoordsFromLocalStorage() {
    let coords = [
      Number(localStorage.getItem('lastMapLatitude') || ''),
      Number(localStorage.getItem('lastMapLongitude') || ''),
    ]

    return coords
  }

  //Определяем местоположение и перемещаем карту
  async setCenterMap(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle) {
    let coords
    try {
      if (this.filterService.getLocationFromlocalStorage()) {
        this.locationService
          .getLocationsIds(Number(this.filterService.getLocationFromlocalStorage()))
          .pipe(
            takeUntil(this.destroy$),
            catchError((err) => {
              console.log(err)
              return of(EMPTY)
            }),
          )
          .subscribe((response) => {
            coords = [response.location.latitude, response.location.longitude]
            this.circleCenterLatitude.next(coords[0])
            this.circleCenterLongitude.next(coords[1])
            this.setPlacemark(map, CirclePoint, coords!, true)
          })
      } else {
        coords = await this.getCurrentLocation()
        this.circleCenterLatitude.next(coords[0])
        this.circleCenterLongitude.next(coords[1])
        this.setPlacemark(map, CirclePoint, coords!, true)
      }
      // coords = await this.getCurrentLocation()
      // this.circleCenterLatitude.next(coords[0])
      // this.circleCenterLongitude.next(coords[1])
      // this.setPlacemark(map, CirclePoint, coords!, true)
    } catch (error) {
      if (!this.filterService.locationId.value) {
        this.navigationService.modalSearchCityesOpen.next(true)
        this.toastService.showToast('Нет доступа к геопозиции', 'warning')
      }
      coords = await this.defaultCoords()
      this.circleCenterLatitude.next(coords[0])
      this.circleCenterLongitude.next(coords[1])
      this.setPlacemark(map, CirclePoint, coords!, false)
    }
    return coords
  }

  setPlacemark(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle, coords?: any, gps?: boolean) {
    // console.log(CirclePoint);
    // await setTimeout(() => {
    //   this.placemark = new ymaps.Placemark(coords, {}, { visible: false });
    // }, 100);

    if (CirclePoint) {
      CirclePoint.geometry?.setCoordinates(coords)
      map.target.setBounds(CirclePoint.geometry?.getBounds()!, {
        checkZoomRange: true,
      })

      if (gps) {
        if (!Capacitor.isNativePlatform()) {
          this.ReserveGeocoder(coords)
        } else {
          this.ReserveGeocoderNative(coords)
        }
      }
    } else {
      // Вызывает ошибку, пока убрал(работает и без этого)
      // setTimeout(async () => {
      //   const placemark = await new ymaps.Placemark(
      //     coords,
      //     {},
      //     { visible: false }
      //   );
      //   this.placemark = placemark;
      //   // await map.target.setBounds(placemark?.geometry?.getBounds()!, {
      //   //   checkZoomRange: false,
      //   // });
      // }, 30);
    }
  }

  //Получаем координаты
  getCurrentLocation() {
    return Geolocation.getCurrentPosition()
      .then((coordinates) => {
        return [coordinates.coords.latitude, coordinates.coords.longitude]
      })
      .catch((e) => {
        throw e
      })
  }

  //Проверка разрешений на GPS
  async requestLocationPermission() {
    try {
      let status = await Geolocation.requestPermissions()
      return status.location
    } catch (e) {
      return
    }
  }

  //поиск координат города или адреса через яндекс
  ForwardGeocoder(address: string) {
    const geocodeResult = this.yaGeocoderService.geocode(address, {
      results: 1,
    })
    return geocodeResult
  }

  //Нативный поиск координат
  ForwardGeocoderNative(address: string) {
    this.nativegeocoder.forwardGeocode(address, this.options).then((result: NativeGeocoderResult[]) => {
      //console.log('координаты ' + result[0].latitude + ' ' + result[0].longitude)
      return [Number(result[0].latitude), Number(result[0].longitude)]
    })
    // .catch((error: any) => console.log(error));
  }

  async ReserveGeocoderNative(coords: number[]) {
    await this.nativegeocoder
      .reverseGeocode(coords[0], coords[1], this.options)
      .then((result: NativeGeocoderResult[]) => {
        let address =
          result[0].administrativeArea +
          ', ' +
          result[0].locality +
          ', ' +
          result[0].thoroughfare +
          ', ' +
          result[0].subThoroughfare
        // console.log('address' + address)
        //this.searchCity(result[0].locality)
        this.searchCity(result[0].locality, result[0].administrativeArea, coords[0], coords[1])
        return address
      })
      .catch((error: any) => console.log(error))
  }

  async ReserveGeocoder(coords: number[]) {
    // Декодирование координат
    const geocodeResult = await this.yaGeocoderService.geocode(coords, {
      results: 1,
    })
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0)
      this.searchCity(
        firstGeoObject.getLocalities(0)[0],
        firstGeoObject.getAdministrativeAreas(0)[0],
        coords[0],
        coords[1],
      )
    })
  }

  searchCity(city: string, region: string, latitude: number, longitude: number) {
    // console.log(`${city}, ${region}, ${latitude}, ${longitude}`)
    this.geolocationCity.next(city)
    this.geolocationRegion.next(region)
    this.geolocationLatitude.next(latitude)
    this.geolocationLongitude.next(longitude)

    if (!this.filterService.getLocationFromlocalStorage()?.length) {
      this.setCoordsFromChangeCityDialog()
      this.showChangeCityDialog.next(true)
    } else if (
      this.geolocationCity.value &&
      this.filterService.getLocationFromlocalStorage() !== this.geolocationCity.value
    ) {
      // this.showChangeCityDialog.next(false);
    }
  }

  //Устанавливаем дефолтные значения после подтверждения диалога на смену города
  setCoordsFromChangeCityDialog() {
    // Запрашиваем ид
    this.locationService
      .getLocationByCoords([this.geolocationLatitude.value, this.geolocationLongitude.value])
      .pipe()
      .subscribe((response: any) => {
        this.geolocationCity.next(response.location.name)
        this.filterService.setLocationTolocalStorage(response.location.id)
        // this.geolocationRegion.next(region);
      })
    // this.filterService.setLocationTolocalStorage(this.geolocationCity.value);
    // this.filterService.setLocationTolocalStorage(this.geolocationRegion.value);
    this.filterService.setLocationLatitudeTolocalStorage(this.geolocationLatitude.value.toString())
    this.filterService.setLocationLongitudeTolocalStorage(this.geolocationLongitude.value.toString())

    // this.showChangeCityDialog.next(false)

    this.filterService.changeFilter.next(true)
    this.filterService.changeCityFilter.next(true)
  }

  hideChangeCityDialog() {
    this.showChangeCityDialog.next(false)
  }

  defaultCoords() {
    let cityCoords = []
    if (!this.filterService.getLocationFromlocalStorage()) {
      this.filterService.setLocationTolocalStorage()
      this.filterService.setLocationLatitudeTolocalStorage()
      this.filterService.setLocationLongitudeTolocalStorage()

      cityCoords.push(
        parseFloat(this.filterService.locationLatitude.value),
        parseFloat(this.filterService.locationLongitude.value),
      )
    } else {
      // this.showChangeCityDialog.next(false);
      cityCoords.push(
        parseFloat(this.filterService.getLocationLatitudeFromlocalStorage()!),
        parseFloat(this.filterService.getLocationLongitudeFromlocalStorage()!),
      )
    }
    return cityCoords
  }

  // Определяем местоположение пользователя
  async positionFilter(map: any, circlePoint: ymaps.Circle) {
    //if (this.filterService.saveFilters.value === 1 || this.filterService.changeCityFilter.value) {
    //Если первый запуск приложения то устанавливаем геопозицию
    if (this.navigationService.appFirstLoading.value) {
      await this.geolocationMapNative(map, circlePoint)
    }
    // Было ещё в условии: this.filterService.changeCityFilter.value &&
    //Если не первый запуск и менялся фильтр города то перекидываем на город

    if (!this.navigationService.appFirstLoading.value) {
      // if (this.filterService.getLocationFromlocalStorage()) {
      //   const coords: any[] = [0, 0]
      //   this.locationService
      //     .getLocationsIds(
      //       Number(this.filterService.getLocationFromlocalStorage()),
      //     )
      //     .pipe(
      //       takeUntil(this.destroy$),
      //       catchError((err) => {
      //         console.log(err)
      //         return of(EMPTY)
      //       }),
      //     )
      //     .subscribe((response) => {
      //       console.log(response)
      //       coords[0] = response.latitude
      //       coords[1] = response.longitude
      //     })
      //   await circlePoint.geometry?.setCoordinates(coords)
      // } else {
      //   const coords = await this.getLastMapCoordsFromLocalStorage()
      //   await circlePoint.geometry?.setCoordinates(coords)
      // }
      const coords = await this.getLastMapCoordsFromLocalStorage()
      await circlePoint.geometry?.setCoordinates(coords)
      // await this.geolocationMapNative(map, circlePoint);
      map.target.setBounds(circlePoint.geometry?.getBounds()!, {
        checkZoomRange: true,
      })
    }
    // await this.geolocationMapNative(map, circlePoint);
    //ветка если юзать this.filterService.saveFilters.value === 1
    // else {
    //   await circlePoint.geometry?.setCoordinates(this.defaultCoords())
    //   map.target.setBounds(circlePoint.geometry?.getBounds()!, {checkZoomRange: true})
    // }
    this.filterService.changeCityFilter.next(false)
  }
}
