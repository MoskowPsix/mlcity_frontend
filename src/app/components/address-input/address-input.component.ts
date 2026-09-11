import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { IPlace } from 'src/app/models/place'
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import { LocationService } from 'src/app/services/location.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, catchError, of, Subject, takeUntil, tap } from 'rxjs'
import { MapService } from 'src/app/services/map.service'
@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss'],
})
export class AddressInputComponent implements OnInit {
  constructor(
    private yaGeocoderService: YaGeocoderService,
    private locationService: LocationService,
  ) {}

  @Input() control?: any
  @Input() type: string = ''
  @Input() label: string = ''
  @Input() placeholder: string = ''
  @Input() readonly: boolean = false
  @Input() openPassword: boolean = false
  @Input() invalid: boolean = false
  @Input() disabled: boolean = false
  @Input() coords!: any
  @Input() place!: IPlace
  @Input() placeId!: string
  @Output() addressEditEmit = new EventEmitter()
  placemark!: ymaps.Placemark
  mapService: MapService = inject(MapService)
  private readonly destroy$ = new Subject<void>()
  map: any
  address: any
  addressForm!: FormGroup
  public addressChange: BehaviorSubject<boolean> = new BehaviorSubject(true)
  setFirstCoords() {
    if (this.place && this.place.latitude) {
      this.coords = [this.place.latitude, this.place.longitude]
    } else {
      if (
        this.mapService.getLastMapCoordsFromLocalStorage().length !== 0 &&
        this.mapService.getLastMapCoordsFromLocalStorage()[0] !== 0
      ) {
        this.coords = this.mapService.getLastMapCoordsFromLocalStorage()
        if (this.addressForm) {
          this.setLongitudelatitude()
        }
      } else {
        this.coords = [55.751574, 37.573856] // Москва по умолчанию
      }
    }
    this.setAdress()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setFirstCoords()
    if (this.map) {
      setTimeout(() => {
        this.addPlacemark(this.coords)
      }, 0)
    }
  }
  emitForm() {
    this.addressEditEmit.emit(this.addressForm.getRawValue())
  }

  onMapReady(event: YaReadyEvent<ymaps.Map>) {
    this.map = event
    this.addPlacemark(this.coords)
    const search = new ymaps.SuggestView('search-map-')
    search.events.add('select', (event: any) => {
      this.map.target.geoObjects.removeAll()
      this.address = event.originalEvent.item.displayName
      // Сразу пишем адрес в форму — иначе при ошибке геокодера кнопка «Далее» остаётся disabled
      this.addressForm.patchValue({ address: this.address })
      this.emitForm()

      let geocodeResult = this.yaGeocoderService.geocode(this.address, {
        results: 1,
      })
      geocodeResult
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => of(null)),
        )
        .subscribe((result: any) => {
          if (!result?.geoObjects?.get(0)) {
            return
          }
          const firstGeoObject = result.geoObjects.get(0)
          this.coords = firstGeoObject.geometry.getCoordinates()
          this.setLongitudelatitude()
          this.setAdress()
          this.addPlacemark(this.coords)
        })
    })
  }
  clearInput(event: HTMLInputElement) {
    event.value = ''
    this.addressForm.patchValue({
      address: '',
      longitude: '',
      latitude: '',
      location_id: '',
    })
    this.emitForm()
  }
  addPlacemark(coords: number[]) {
    if (!this.map?.target) {
      return
    }
    this.map.target.geoObjects.removeAll()
    this.placemark = new ymaps.Placemark(coords)
    this.map.target.geoObjects.add(this.placemark)
  }
  onMapClick(e: YaEvent<ymaps.Map>) {
    const { target, event } = e
    this.map.target.geoObjects.removeAll()
    this.addPlacemark([event.get('coords')[0], event.get('coords')[1]])
    this.coords = [event.get('coords')[0], event.get('coords')[1]]
    this.setAdress()
    this.setLongitudelatitude()
  }
  setAdress() {
    if (!this.coords || !this.addressForm) {
      return
    }
    const geocodeResult = this.yaGeocoderService.geocode(this.coords, {
      results: 1,
    })
    geocodeResult
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null)),
        tap((result: any) => {
          const firstGeoObject = result?.geoObjects?.get(0)
          if (firstGeoObject) {
            this.addressForm.patchValue({ address: firstGeoObject.getAddressLine() })
          }
        }),
      )
      .subscribe(() => {
        // Сначала отдаём адрес/координаты родителю, location_id — опционально
        this.emitForm()
        this.setLocationId()
      })
  }
  setLongitudelatitude() {
    if (!this.addressForm || !this.coords) {
      return
    }
    this.addressForm.patchValue({
      longitude: this.coords[1],
      latitude: this.coords[0],
    })
  }
  setLocationId() {
    if (!this.coords) {
      return
    }
    this.locationService
      .getLocationByCoords(this.coords)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null)),
      )
      .subscribe((res: any) => {
        if (res?.location?.id) {
          this.addressForm.patchValue({ location_id: res.location.id })
          this.emitForm()
        }
      })
  }
  ngAfterViewInit() {
    this.setFirstCoords()
    if (this.place) {
      this.setFormInLoad()
      this.testLog()
    }
  }
  testLog() {}
  setFormInLoad() {
    this.setLongitudelatitude()
    if (this.place?.address) {
      this.addressForm.patchValue({ address: this.place.address })
      this.emitForm()
    }
    this.setAdress()
  }

  ngOnInit() {
    this.addressForm = new FormGroup({
      placeId: new FormControl(this.placeId, [Validators.required]),
      address: new FormControl(this.place?.address || '', [Validators.required]),
      longitude: new FormControl(this.place?.longitude || '', [Validators.required]),
      latitude: new FormControl(this.place?.latitude || '', [Validators.required]),
      location_id: new FormControl((this.place as any)?.location_id || '', [Validators.required]),
    })
  }
}
