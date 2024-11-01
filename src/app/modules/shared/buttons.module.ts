import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component'
import { CircleButtonComponent } from 'src/app/components/materials/circle-button/circle-button.component'
import { IonSpinner } from '@ionic/angular'
import { IonicModule } from '@ionic/angular'
import { StandartButtonComponent } from 'src/app/components/materials/standart-button/standart-button.component'
import { SearchButtonComponent } from 'src/app/components/materials/search-button/search-button.component'
@NgModule({
  declarations: [BackButtonComponent, CircleButtonComponent, StandartButtonComponent, SearchButtonComponent],
  imports: [CommonModule, IonicModule],
  exports: [BackButtonComponent, CircleButtonComponent, StandartButtonComponent, SearchButtonComponent],
})
export class ButtonsModule {}
