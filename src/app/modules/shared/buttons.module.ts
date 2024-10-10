import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component'
import { CircleButtonComponent } from 'src/app/components/materials/circle-button/circle-button.component'
import { IonSpinner } from '@ionic/angular'
import { IonicModule } from '@ionic/angular'
@NgModule({
  declarations: [BackButtonComponent, CircleButtonComponent],
  imports: [CommonModule, IonicModule],
  exports: [BackButtonComponent, CircleButtonComponent],
})
export class ButtonsModule {}
