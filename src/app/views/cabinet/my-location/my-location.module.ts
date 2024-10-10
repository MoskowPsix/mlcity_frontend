import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { MyLocationPageRoutingModule } from './my-location-routing.module'
import { MyLocationPage } from './my-location.page'
import { AppModule } from 'src/app/app.module'
import { SecondHeaderComponent } from 'src/app/components/second-header/second-header.component'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { ButtonsModule } from 'src/app/modules/shared/buttons.module'
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps'
import { environment } from 'src/environments/environment'
const mapConfig: YaConfig = {
  apikey: environment.apiKeyYandex + '&' + `suggest_apikey=${environment.apiKeyYandexSubject}`,
  lang: 'ru_RU',
}
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyLocationPageRoutingModule,
    SharedModule,
    ButtonsModule,
    AngularYandexMapsModule.forRoot(mapConfig),
  ],
  declarations: [MyLocationPage],
})
export class MyLocationPageModule {}
