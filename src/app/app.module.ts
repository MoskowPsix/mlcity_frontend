import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EventsComponent } from './view/events/events.component';
import { CabinetComponent } from './view/cabinet/cabinet.component';
import { HomeComponent } from './view/home/home.component';
import { TabsComponent } from './view/tabs/tabs.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { YaConfig } from 'angular8-yandex-maps/public-api';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';

const mapConfig: YaConfig = {
  apikey: environment.apiKeyYandex,
  lang: 'ru_RU',
};

@NgModule({
  declarations: [
    AppComponent,
    EventsComponent,
    CabinetComponent,
    HomeComponent,
    TabsComponent,
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, AngularYandexMapsModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})


export class AppModule {}
