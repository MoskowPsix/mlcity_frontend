import { ChangeDetectorRef, Injectable } from '@angular/core'
import { YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import {
  NativeGeocoder,
  NativeGeocoderOptions,
  NativeGeocoderResult,
} from '@awesome-cordova-plugins/native-geocoder/ngx'
import { Capacitor } from '@capacitor/core'
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx'
import { Geolocation } from '@capacitor/geolocation'
import { BehaviorSubject, catchError, EMPTY, of, Subject, Subscription, takeUntil } from 'rxjs'
import { FilterService } from './filter.service'
import { NavigationService } from './navigation.service'
import { LocationService } from './location.service'
import { ToastService } from './toast.service'
import { UserPointService } from './user-point.service'
import { AuthService } from './auth.service'
import { serialize } from 'object-to-formdata'

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly destroy$ = new Subject<void>()
  private createPointSub!: Subscription
  placemark?: ymaps.Placemark

  getPointsSubs!: Subscription

  public circleCenterLatitude: BehaviorSubject<number> = new BehaviorSubject(0)
  public circleCenterLongitude: BehaviorSubject<number> = new BehaviorSubject(0)

  public showChangeCityDialog: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public geolocationCity: BehaviorSubject<string> = new BehaviorSubject('')
  public radius: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationLatitude: BehaviorSubject<number> = new BehaviorSubject(
    Number(localStorage.getItem('lastMapLatitude')),
  )
  public geolocationLongitude: BehaviorSubject<number> = new BehaviorSubject(
    Number(localStorage.getItem('lastMapLongitude')),
  )
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
    private userPointService: UserPointService,
    private authService: AuthService,
  ) {
    this.authService.authenticationState.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value) {
        this.setHomeCoords()
      }
      //   if (value) {
      //     var coords: any = null
      //     if (this.getPointsSubs) {
      //       this.getPointsSubs.unsubscribe()
      //     }
      //     this.getPointsSubs = this.userPointService
      //       .getPoints()
      //       .pipe(
      //         takeUntil(this.destroy$),
      //         catchError(() => of(EMPTY)),
      //       )
      //       .subscribe((response: any) => {
      //         if (response.points.data.length) {
      //           coords = {
      //             latitude: response.points.data[0].latitude,
      //             longitude: response.points.data[0].longitude,
      //           }
      //           this.userPointService.homeLatitude.next(coords.latitude)
      //           this.userPointService.homeLongitude.next(coords.longitude)
      //           this.goHomeCoords()
      //         } else {
      //           const coords = this.getLastMapCoordsFromLocalStorage()
      //           let data: FormData = serialize({
      //             latitude: coords[0],
      //             longitude: coords[1],
      //           })
      //           this.userPointService
      //             .createUserPoint(data)
      //             .pipe(
      //               takeUntil(this.destroy$),
      //               catchError(() => {
      //                 return of(EMPTY)
      //               }),
      //             )
      //             .subscribe((response: any) => {
      //               this.userPointService.homeLatitude.next(String(coords[0]))
      //               this.userPointService.homeLongitude.next(String(coords[1]))
      //             })
      //           // this.createPointSub = this.userPointService.createHomeCoords(Number(coords[0]), Number(coords[1]))
      //         }
      //       })
      //   }
    })
  }

  goHomeCoords() {
    console.log(this.userPointService.homeLatitude.value)
    if (this.userPointService.homeLatitude.value && this.userPointService.homeLongitude.value) {
      this.filterService.setLocationLatitudeTolocalStorage(String(this.userPointService.homeLatitude.value))
      this.filterService.setLocationLongitudeTolocalStorage(String(this.userPointService.homeLongitude.value))
      this.setLastMapCoordsToLocalStorage(
        this.userPointService.homeLatitude.value,
        this.userPointService.homeLongitude.value,
      )
      this.circleCenterLatitude.next(Number(this.userPointService.homeLatitude.value))
      this.circleCenterLongitude.next(Number(this.userPointService.homeLongitude.value))
      this.filterService.changeCityFilter.next(true)
      this.filterService.changeFilter.next(true)
      return true
    } else {
      return false
    }
  }

  // Проверка домашних координат и их установка если пользователь авторизован
  public setHomeCoords() {
    var coords: any = null
    if (this.getPointsSubs) {
      this.getPointsSubs.unsubscribe()
    }
    this.getPointsSubs = this.userPointService
      .getPoints()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(EMPTY)),
      )
      .subscribe((response: any) => {
        if (response?.points?.data.length) {
          coords = {
            latitude: response.points.data[0].latitude,
            longitude: response.points.data[0].longitude,
          }
          this.userPointService.homeLatitude.next(coords.latitude)
          this.userPointService.homeLongitude.next(coords.longitude)
          this.filterService.setLocationLatitudeTolocalStorage(coords.latitude)
          this.filterService.setLocationLongitudeTolocalStorage(coords.longitude)
          this.setLastMapCoordsToLocalStorage(coords.latitude, coords.longitude)
          this.circleCenterLatitude.next(coords.latitude)
          this.circleCenterLongitude.next(coords.longitude)
          this.filterService.changeCityFilter.next(true)
          this.filterService.changeFilter.next(true)
        } else {
          const coords = this.getLastMapCoordsFromLocalStorage()
          let data: FormData = serialize({
            latitude: coords[0],
            longitude: coords[1],
          })
          // this.createPointSub = this.userPointService.createHomeCoords(Number(coords[0]), Number(coords[1]))
        }
      })
  }

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

  setRadius(radius: number) {
    this.radius.next(radius)
    localStorage.setItem('radius', String(radius))
  }
  getRadiusFromLocalStorage() {
    return localStorage.getItem('radius')
  }
  //Определение геопозиции нативными способами платформы
  async geolocationMapNative(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle) {
    // if (this.authService.authenticationState.value) {
    //   let coords = []
    //   coords.push(
    //     parseFloat(this.userPointService.homeLatitude.value!),
    //     parseFloat(this.userPointService.homeLongitude.value!),
    //   )
    //   await this.setPlacemark(map, CirclePoint, coords!, false)
    //   return
    // }
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      // await this.setCenterMap(map, CirclePoint);
      return
    }

    if (!Capacitor.isNativePlatform()) {
      //Запускаем поиск геопозиции в вебе
      await this.setCenterMap(map, CirclePoint)
    } else {
      //Запускаем поиск геопозиции в мобилах
      const status = await this.requestLocationPermission()
      try {
        if (status == 'granted') {
          await this.setCenterMap(map, CirclePoint)
        } else {
          //Если запрещен доступ GPS
          let coords = await this.defaultCoords()
          await this.setCenterMap(map, CirclePoint)
          // await this.setPlacemark(map, CirclePoint, coords!, false)
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
      if (canRequest) {
        await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
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
    let coords = [Number(this.geolocationLatitude.value), Number(this.geolocationLongitude.value)]

    return coords
  }

  //Определяем местоположение и перемещаем карту
  async setCenterMap(map: YaReadyEvent<ymaps.Map>, CirclePoint?: ymaps.Circle) {
    let coords
    try {
      if (this.filterService.getLocationFromlocalStorage() && !this.authService.authenticationState.value) {
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
      } else if (
        this.authService.authenticationState.value &&
        this.userPointService.homeLatitude.value &&
        this.userPointService.homeLongitude.value
      ) {
        coords = [Number(this.userPointService.homeLatitude.value), Number(this.userPointService.homeLongitude.value)]
        this.circleCenterLatitude.next(Number(coords[0]))
        this.circleCenterLongitude.next(Number(coords[1]))
        this.setPlacemark(map, CirclePoint, coords!, true)
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
    // this.filterService.changeCityFilter.next(true)
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
    // Если не первый запуск и менялся фильтр города то перекидываем на город
    if (!this.navigationService.appFirstLoading.value) {
      let coords = await this.getLastMapCoordsFromLocalStorage()
      await circlePoint.geometry?.setCoordinates(coords)
      // await this.geolocationMapNative(map, circlePoint);
      map.target.setBounds(circlePoint.geometry?.getBounds()!, {
        checkZoomRange: false,
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
