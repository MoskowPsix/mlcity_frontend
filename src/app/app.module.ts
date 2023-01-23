import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './routing/app-routing.module';

import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';

import { AppComponent } from './app.component';
import { EventsComponent } from './views/events/events.component';
import { CabinetComponent } from './views/cabinet/cabinet.component';
import { HomeComponent } from './views/home/home.component';
import { TabsComponent } from './views/tabs/tabs.component';
// import { YaConfig } from 'angular8-yandex-maps/public-api';
// import { environment } from '../environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './views/login/login.component';

import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service'; 
import { TokenService } from './services/token.service';
import { UserService } from './services/user.service';
import { LoadingService } from './services/loading.service';

import { environment } from '../environments/environment';
import { XsrfInterceptor } from './xsrf.interceptor';

import { AuthGuard } from './guards/auth.guard';
import { LoggedInAuthGuard } from './guards/logged-in-auth.guard';


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
    LoginComponent,
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    AngularYandexMapsModule.forRoot(mapConfig), 
    HttpClientModule, 
    ReactiveFormsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
    AuthService, 
    LoadingService,
    TokenService,
    ToastService,
    UserService,
    AuthGuard,
    LoggedInAuthGuard
  ],
  bootstrap: [AppComponent],
})

export class AppModule {}