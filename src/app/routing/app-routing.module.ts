import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authRoutes } from './auth-routes';
import { privateRoutes } from './private-routes';
import { publicRoutes } from './public-routes';



const routes: Routes = [ 
  // {
  //   path: 'home',
  //   component: HomeComponent
  // },
  // {
  //   path: 'events',
  //   component: EventsComponent
  // },
  // {
  //   path: 'cabinet',
  //   component: CabinetComponent
  // },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },
  ...publicRoutes,
  ...privateRoutes,
  ...authRoutes,
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
