import { Injectable } from '@angular/core'
import { MetrikaModule } from 'ng-yandex-metrika'
@Injectable({
  providedIn: 'root',
})
export class YandexMetricService {
  constructor() {}

  metrica() {
    MetrikaModule.forRoot({
      id: 96112606,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    })
  }
}
