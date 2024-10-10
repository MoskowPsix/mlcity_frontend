import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { MyLocationPage } from './my-location.page'

const routes: Routes = [
  {
    path: '',
    component: MyLocationPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyLocationPageRoutingModule {}
