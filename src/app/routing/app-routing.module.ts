import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authRoutes } from './auth-routes';
import { errorsRoutes } from './errors-routes copy';
import { privateRoutes } from './private-routes';
import { publicRoutes } from './public-routes';

const routes: Routes = [ 
  ...publicRoutes,
  ...privateRoutes,
  ...authRoutes,
  ...errorsRoutes // Всегда должен быть в конце
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
