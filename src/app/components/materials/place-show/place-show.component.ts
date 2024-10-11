import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { YaReadyEvent } from 'angular8-yandex-maps'
import { IPlace } from 'src/app/models/place'
import { ToastService } from 'src/app/services/toast.service'

@Component({
  selector: 'app-place-show',
  templateUrl: './place-show.component.html',
  styleUrls: ['./place-show.component.scss'],
})
export class PlaceShowComponent implements OnInit {
  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {}
  @Input() place!: any
  @Input() priceState!: string
  @Input() buyLink!: string
  public map!: YaReadyEvent<ymaps.Map>
  onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>, place: any) {
    this.map = { target, ymaps }
    target.geoObjects.add(new ymaps.Placemark([place.latitude, place.longitude], {}, { preset: 'twirl#violetIcon' }))
    this.map.target.controls.remove('zoomControl')
    this.map.target.behaviors.disable('drag')
  }
  goToPoint(): void {
    if (this.place?.latitude && this.place?.longitude) {
      window.location.href = 'https://yandex.ru/maps/?rtext=~' + this.place.latitude + ',' + this.place.longitude
    } else {
      this.toastService.showToast('Произошла ошибка при получении координат', 'warning')
    }
  }
  ngOnInit() {}
}
