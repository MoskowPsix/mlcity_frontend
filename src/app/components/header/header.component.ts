import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenu } from 'src/app/models/menu';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { MapService } from 'src/app/services/map.service';
import { PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit,OnDestroy {

  private readonly destroy$ = new Subject<void>()

  menuPublic: IMenu[] = []
  appName = environment.APP_NAME

  showBackButton: boolean = true

  city:string = ''
  geolocationCity:string = ''
  showChangeCityDialog:boolean = false
  radius:number = 1

  constructor(private navigationServise: NavigationService, private mapService: MapService) { }

  setCityFromDialog(){
    this.mapService.setCoordsFromChangeCityDialog()
    this.mapService.hideChangeCityDialog()
  }
  
  ngOnInit() {

    //Смотрим состояние кнопки назад
    this.navigationServise.showBackButton.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.showBackButton = value;
    });

    //Подписываемся на город
    this.mapService.city.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.city = value;
    });

    //Подписываемся на город из Геолокации
    this.mapService.geolocationCity.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.geolocationCity = value;
    });

     //Подписываемся на изменение радиуса
     this.mapService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value);
    });

    //Показывать ли диалог о смене города
    this.mapService.showChangeCityDialog.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.showChangeCityDialog = value;
      console.log('showChangeCityDialog ' +value)
    });
    
    this.menuPublic = menuPublicData

    //Capacitor.isNativePlatform() ? console.log('ипользуется мобильная версия') : console.log('ипользуется веб версия')
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
