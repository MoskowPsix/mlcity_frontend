import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './routing/app-routing.module';

import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';

import { AppComponent } from './app.component';
import { EventsComponent } from './views/events/events.component';
import { CabinetComponent } from './views/cabinet/cabinet.component';
import { HomeComponent } from './views/home/home.component';
import { TabsComponent } from './views/tabs/tabs.component';
import { LoginComponent } from './views/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AddEventComponent } from './views/add-event/add-event.component';
import { DropdownPopupComponent } from './components/dropdown-popup/dropdown-popup.component';
import { MenuAuthComponent } from './components/menu-auth/menu-auth.component';
import { MenuAuthSidebarComponent } from './components/menu-auth-sidebar/menu-auth-sidebar.component';

import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service'; 
import { TokenService } from './services/token.service';
import { UserService } from './services/user.service';
import { LoadingService } from './services/loading.service';
import { MapService } from './services/map.service';

import { environment } from '../environments/environment';
import { XsrfInterceptor } from './xsrf.interceptor';

import { AuthGuard } from './guards/auth.guard';
import { LoggedInAuthGuard } from './guards/logged-in-auth.guard';

import { ClickOutsideDirective } from './directives/click-outside.directive';


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
    HeaderComponent,
    SidebarComponent,
    AddEventComponent,
    DropdownPopupComponent,
    MenuAuthComponent,
    MenuAuthSidebarComponent,
    ClickOutsideDirective,
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
    LoggedInAuthGuard,
    MapService,
  ],
  bootstrap: [AppComponent],
})

export class AppModule {}