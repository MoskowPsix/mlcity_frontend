import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SecondHeaderComponent } from 'src/app/components/second-header/second-header.component'
import { IonicModule } from '@ionic/angular'
@NgModule({
  declarations: [SecondHeaderComponent],
  imports: [CommonModule, IonicModule.forRoot()],
  exports: [SecondHeaderComponent],
  providers: [],
  entryComponents: [],
  bootstrap: [],
  schemas: [],
})
export class SharedModule {}
