import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IPlace } from 'src/app/models/place'
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import { LocationService } from 'src/app/services/location.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, tap } from 'rxjs'
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
  map: any
  address: any
  addressForm!: FormGroup
  public addressChange: BehaviorSubject<boolean> = new BehaviorSubject(true)
  setFirstCoords() {
    if (this.place.latitude) {
      this.coords = [this.place.latitude, this.place.longitude]
    } else {
      this.coords = [55.751574, 37.573856] // Москва по умолчанию
    }
  }
  emitForm() {
    this.addressEditEmit.emit(this.addressForm.value)
  }
  onMapReady(event: YaReadyEvent<ymaps.Map>) {
    this.map = event
    this.addPlacemark(this.coords)
    const search = new ymaps.SuggestView('search-map-')
    search.events.add('select', (event: any) => {
      this.map.target.geoObjects.removeAll()
      this.address = event.originalEvent.item.displayName
      let geocodeResult = this.yaGeocoderService.geocode(this.address, {
        results: 1,
      })
      geocodeResult.pipe().subscribe((result: any) => {
        const firstGeoObject = result.geoObjects.get(0)
        this.coords = firstGeoObject.geometry.getCoordinates()
        this.setLongitudelatitude()
        this.setAdress()
        this.addPlacemark(this.coords)
      })
    })
  }
  addPlacemark(coords: number[]) {
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
    const geocodeResult = this.yaGeocoderService.geocode(this.coords, {
      results: 1,
    })
    geocodeResult
      .pipe(
        tap((result: any) => {
          const firstGeoObject = result.geoObjects.get(0)
          // this.address = firstGeoObject.getAddressLine()
          this.addressForm.value.address = firstGeoObject.getAddressLine()
        }),
      )
      .subscribe((result: any) => {
        this.setLocationId()
      })
  }
  setLongitudelatitude() {
    this.addressForm.value.longitude = this.coords[1]
    this.addressForm.value.latitude = this.coords[0]
  }
  setLocationId() {
    this.locationService
      .getLocationByCoords(this.coords)
      .pipe()
      .subscribe((res: any) => {
        this.addressForm.value.location_id = res.location.id
        this.emitForm()
      })
  }
  ngAfterViewInit() {
    this.setFormInLoad()
  }
  testLog() {
    console.log(this.addressForm.value)
  }
  setFormInLoad() {
    this.setLongitudelatitude()
    this.setAdress()
  }
 
  ngOnInit() {
    this.addressForm = new FormGroup({
      placeId: new FormControl(this.placeId, [Validators.required]),
      address: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      latitude: new FormControl('', [Validators.required]),
      location_id: new FormControl('', [Validators.required]),
    })
    this.setFirstCoords()
  }
}