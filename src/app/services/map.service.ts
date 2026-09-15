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
import { BehaviorSubject, catchError, EMPTY, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs'
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

  // Number(null) === 0 → карта уходит в океан [0,0]; берём Москву как fallback
  private readonly defaultLatitude = 55.7522
  private readonly defaultLongitude = 37.6156

  public circleCenterLatitude: BehaviorSubject<number> = new BehaviorSubject(
    this.readStoredCoord('lastMapLatitude', this.defaultLatitude),
  )
  public circleCenterLongitude: BehaviorSubject<number> = new BehaviorSubject(
    this.readStoredCoord('lastMapLongitude', this.defaultLongitude),
  )

  public showChangeCityDialog: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public geolocationCity: BehaviorSubject<string> = new BehaviorSubject('')
  public radius: BehaviorSubject<number> = new BehaviorSubject(0)
  public geolocationLatitude: BehaviorSubject<number> = new BehaviorSubject(
    this.readStoredCoord('lastMapLatitude', this.defaultLatitude),
  )
  public geolocationLongitude: BehaviorSubject<number> = new BehaviorSubject(
    this.readStoredCoord('lastMapLongitude', this.defaultLongitude),
  )
  public geolocationRegion: BehaviorSubject<string> = new BehaviorSubject('')

  private readStoredCoord(key: string, fallback: number): number {
    const raw = localStorage.getItem(key)
    if (raw == null || raw === '') {
      return fallback
    }
    const value = Number(raw)
    // 0/0 — типичный мусор после Number(null); для приложения это невалидные координаты
    if (!Number.isFinite(value) || value === 0) {
      return fallback
    }
    return value
  }

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
    const latitude = Number(lat)
    const longitude = Number(long)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
      return
    }
    localStorage.setItem('lastMapLatitude', String(latitude))
    localStorage.setItem('lastMapLongitude', String(longitude))
    this.geolocationLatitude.next(latitude)
    this.geolocationLongitude.next(longitude)
  }

  getLastMapCoordsFromLocalStorage() {
    const latitude = Number(this.geolocationLatitude.value)
    const longitude = Number(this.geolocationLongitude.value)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
      return this.defaultCoords()
    }
    return [latitude, longitude]
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
    this.yaGeocoderService
      .geocode(coords, {
        results: 1,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        const parsed = this.parseYandexGeoObject(result?.geoObjects?.get?.(0))
        if (!parsed?.cityName) {
          return
        }
        this.searchCity(parsed.cityName, parsed.regionName, coords[0], coords[1])
      })
  }

  /** Город по координатам: сначала API бэка, иначе Яндекс + поиск по имени */
  resolveLocationFromCoords(coords: number[]): Observable<{
    location: any | null
    cityName: string
    regionName: string
  } | null> {
    return this.locationService.getLocationByCoords(coords).pipe(
      catchError(() => of(null)),
      switchMap((response: any) => {
        if (response?.location) {
          return of({
            location: response.location,
            cityName: response.location.name,
            regionName: response.location.location_parent?.name ?? '',
          })
        }
        return this.resolveLocationViaYandexAndName(coords)
      }),
    )
  }

  private resolveLocationViaYandexAndName(coords: number[]) {
    // yaGeocoderService.geocode уже возвращает Observable<object>
    return this.yaGeocoderService.geocode(coords, { results: 1 }).pipe(
      switchMap((result: any) => {
        const parsed = this.parseYandexGeoObject(result?.geoObjects?.get?.(0))
        if (!parsed?.cityName) {
          return of(null)
        }

        this.geolocationCity.next(parsed.cityName)
        this.geolocationRegion.next(parsed.regionName)

        return this.findBackendLocationByName(parsed.cityName, parsed.regionName).pipe(
          map((match) => {
            if (match) {
              return {
                location: match,
                cityName: match.name,
                regionName: match.location_parent?.name ?? parsed.regionName,
              }
            }
            return {
              location: null,
              cityName: parsed.cityName,
              regionName: parsed.regionName,
            }
          }),
        )
      }),
      catchError(() => of(null)),
    )
  }

  private parseYandexGeoObject(geo: any): { cityName: string; regionName: string } | null {
    if (!geo) {
      return null
    }

    const localities = geo.getLocalities?.() || []
    const areas = geo.getAdministrativeAreas?.() || []
    let cityName = (Array.isArray(localities) ? localities[0] : localities) || ''
    let regionName = (Array.isArray(areas) ? areas[0] : areas) || ''

    // Надёжнее достаём kind=locality / province из Address.Components
    try {
      const components =
        geo.properties?.get?.('metaDataProperty.GeocoderMetaData.Address.Components') || []
      if (Array.isArray(components) && components.length) {
        const locality =
          components.find((c: any) => c.kind === 'locality')?.name ||
          components.find((c: any) => c.kind === 'area')?.name ||
          components.find((c: any) => c.kind === 'district')?.name
        const province =
          components.find((c: any) => c.kind === 'province')?.name ||
          components.find((c: any) => c.kind === 'area')?.name
        if (locality) {
          cityName = locality
        }
        if (province) {
          regionName = province
        }
      }
    } catch {
      // ignore meta parse errors
    }

    if (!cityName) {
      return null
    }
    return { cityName, regionName: regionName || '' }
  }

  private findBackendLocationByName(cityName: string, regionName: string) {
    const byName$ = this.locationService.getLocationsName(cityName).pipe(
      catchError(() => of(null)),
      map((res: any) => this.pickLocationFromResponse(res, cityName, regionName)),
    )

    if (!regionName) {
      return byName$
    }

    return this.locationService.getLocationsWithRegion(cityName, regionName).pipe(
      catchError(() => of(null)),
      switchMap((res: any) => {
        const match = this.pickLocationFromResponse(res, cityName, regionName)
        if (match) {
          return of(match)
        }
        return byName$
      }),
    )
  }

  private pickLocationFromResponse(res: any, cityName: string, regionName: string) {
    const raw = res?.locations ?? res?.location ?? res
    const locations: any[] = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && raw.name ? [raw] : []
    if (!locations.length) {
      return null
    }
    return (
      locations.find(
        (item) =>
          item.name === cityName && (!regionName || item.location_parent?.name === regionName),
      ) ||
      locations.find((item) => item.name === cityName) ||
      locations[0] ||
      null
    )
  }

  searchCity(city: string, region: string, latitude: number, longitude: number) {
    // console.log(`${city}, ${region}, ${latitude}, ${longitude}`)
    this.geolocationCity.next(city)
    this.geolocationRegion.next(region)
    this.geolocationLatitude.next(latitude)
    this.geolocationLongitude.next(longitude)

    // Всегда синхронизируем locationId с текущими координатами (кнопка GPS / геокодер)
    this.setCoordsFromChangeCityDialog()
    if (!this.filterService.getLocationFromlocalStorage()?.length) {
      this.showChangeCityDialog.next(true)
    }
  }

  //Устанавливаем дефолтные значения после подтверждения диалога на смену города
  setCoordsFromChangeCityDialog() {
    const latitude = Number(this.geolocationLatitude.value) || this.defaultLatitude
    const longitude = Number(this.geolocationLongitude.value) || this.defaultLongitude
    this.filterService.setLocationLatitudeTolocalStorage(String(latitude))
    this.filterService.setLocationLongitudeTolocalStorage(String(longitude))
    this.resolveLocationFromCoords([latitude, longitude])
      .pipe(takeUntil(this.destroy$))
      .subscribe((resolved) => {
        if (resolved?.cityName) {
          this.geolocationCity.next(resolved.cityName)
        }
        if (resolved?.regionName) {
          this.geolocationRegion.next(resolved.regionName)
        }
        if (resolved?.location?.id) {
          this.filterService.setLocationTolocalStorage(resolved.location.id)
        }
        this.filterService.changeFilter.next(true)
      })
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
    //Если первый запуск приложения то устанавливаем геопозицию
    if (this.navigationService.appFirstLoading.value) {
      await this.geolocationMapNative(map, circlePoint)
    }
    // Если не первый запуск и менялся фильтр города то перекидываем на город
    if (!this.navigationService.appFirstLoading.value) {
      let coords = await this.getLastMapCoordsFromLocalStorage()
      await circlePoint.geometry?.setCoordinates(coords)
      this.circleCenterLatitude.next(coords[0])
      this.circleCenterLongitude.next(coords[1])
      map.target.setBounds(circlePoint.geometry?.getBounds()!, {
        checkZoomRange: false,
      })
    }
    this.filterService.changeCityFilter.next(false)
  }
}
