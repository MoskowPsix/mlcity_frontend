import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { environment } from 'src/environments/environment'
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps'
const mapConfig: YaConfig = {
  apikey: environment.apiKeyYandex + '&' + `suggest_apikey=${environment.apiKeyYandexSubject}`,
  lang: 'ru_RU',
}
@NgModule({
  declarations: [],
  imports: [CommonModule, AngularYandexMapsModule.forRoot(mapConfig)],
  exports: [AngularYandexMapsModule],
})
export class MapModule {}
