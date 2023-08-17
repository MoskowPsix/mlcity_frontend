import { NgModule, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { registerLocaleData, DatePipe  } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClientJsonpModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';

import { AppRoutingModule } from './routing/app-routing.module';

import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';

import { AppComponent } from './app.component';
import { EventsComponent } from './views/events/events.component';
import { CabinetComponent } from './views/cabinet/cabinet.component';
import { HomeComponent } from './views/home/HomeComponent';
import { LoginComponent } from './views/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AddEventComponent } from './views/add-event/add-event.component';
import { DropdownPopupComponent } from './components/dropdown-popup/dropdown-popup.component';
import { MenuAuthComponent } from './components/menu-auth/menu-auth.component';
import { MenuAuthSidebarComponent } from './components/menu-auth-sidebar/menu-auth-sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutComponent } from './views/about/about.component';
import { NotFoundComponent } from './views/errors/not-found/not-found.component';
import { ForbiddenComponent } from './views/errors/forbidden/forbidden.component';
import { ServerErrorComponent } from './views/errors/server-error/server-error.component';
import { EventShowComponent } from './views/events/event-show/event-show.component';
import { SightShowComponent } from './views/sights/sight-show/sight-show.component';
import { EventCreateComponent } from './views/events/event-create/event-create.component';
import { SightsComponent } from './views/sights/sights.component';
import { SightCreateComponent } from './views/sights/sight-create/sight-create.component';
import { ReadMoreComponent } from './components/read-more/read-more.component';
import { FiltersComponent } from './components/filters/filters.component';
import {FiltersNotButtonComponent} from './components/filters_not_button/filters_not_button.component'
import { NoDataComponent } from './components/no-data/no-data.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { FavoritesComponent } from './views/cabinet/favorites/favorites.component';

import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service'; 
import { TokenService } from './services/token.service';
import { UserService } from './services/user.service';
import { LoadingService } from './services/loading.service';
import { MapService } from './services/map.service';

import { environment } from '../environments/environment';
import { AuthTokenInterceptor } from './auth-token.interceptor';

import { AuthGuard } from './guards/auth.guard';
import { LoggedInAuthGuard } from './guards/logged-in-auth.guard';
import { CheckAuthCanActiveGuard } from './guards/check-auth.can-active.guard';
import { EventTypeService } from './services/event-type.service';
import { EventsService } from './services/events.service';
import { SightTypeService } from './services/sight-type.service';

import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { TruncatePipe } from './pipes/truncate.pipe';
import { BackButtonDirective } from './directives/back-button.directive';


const mapConfig: YaConfig = {
  apikey: environment.apiKeyYandex,
  lang: 'ru_RU',
};

registerLocaleData(localeRu, 'ru');

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    EventsComponent,
    CabinetComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    SidebarComponent,
    AddEventComponent,
    DropdownPopupComponent,
    MenuAuthComponent,
    MenuAuthSidebarComponent,
    FooterComponent,
    AboutComponent,
    NotFoundComponent,
    ForbiddenComponent,
    ServerErrorComponent,
    EventShowComponent,
    EventCreateComponent,
    SightsComponent,
    SightShowComponent,
    SightCreateComponent,
    ReadMoreComponent,
    FiltersComponent,
    FiltersNotButtonComponent,
    NoDataComponent,
    EventCardComponent,
    FavoritesComponent,
    TruncatePipe,
    BackButtonDirective
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    IonicModule.forRoot(), 
    AppRoutingModule, 
    AngularYandexMapsModule.forRoot(mapConfig), 
    HttpClientModule, 
    HttpClientJsonpModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    AuthService, 
    LoadingService,
    TokenService,
    ToastService,
    UserService,
    MapService,
    EventTypeService,
    EventsService,
    SightTypeService,
    AuthGuard,
    LoggedInAuthGuard,
    CheckAuthCanActiveGuard,
    NativeGeocoder,
    LocationAccuracy,
    DatePipe,
    TruncatePipe,
  ],
  bootstrap: [AppComponent],
})

export class AppModule {}