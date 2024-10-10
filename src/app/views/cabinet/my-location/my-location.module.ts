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
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MyLocationPageRoutingModule, SharedModule, ButtonsModule],
  declarations: [MyLocationPage],
})
export class MyLocationPageModule {}
