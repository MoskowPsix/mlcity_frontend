import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenu } from 'src/app/models/menu';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { MapService } from 'src/app/services/map.service';
import { FormControl } from '@angular/forms';
import { VkService } from 'src/app/services/vk.service';
import { ToastService } from 'src/app/services/toast.service';
import { MessagesCityes } from 'src/app/enums/messages-cityes';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit,OnDestroy {

  private readonly destroy$ = new Subject<void>()

  menuPublic: IMenu[] = []
  appName = environment.APP_NAME

  modalSearchCityesOpen: boolean = false
  modalSearchEventsOpen: boolean = false

  showBackButton: boolean = true

  city:string = ''
  geolocationCity:string = ''
  showChangeCityDialog:boolean = false
  radius:number = 1
  region:string = ''
  geolocationRegion:string = ''

  minLengthCityesListError:boolean = false
  minLengthEventsListError:boolean = false

  cityesList: any[] = [];
  cityesListLoading:boolean = false
  searchCityes: FormControl =  new FormControl('')
  eventsListLoading:boolean = false
  eventsList: [] = [];
  searchEvents: FormControl =  new FormControl('')

  constructor(
    private navigationServise: NavigationService, 
    private mapService: MapService, 
    private vkService: VkService,
    private toastService: ToastService

    ) { }

  //Установить город из диалога, из геопозиции
  setCityFromDialog(){
    this.mapService.setCoordsFromChangeCityDialog()
    this.mapService.hideChangeCityDialog()
    this.toastService.showToast(MessagesCityes.setCitySuccess, 'success')
  }

  //Скрыть диалог подтверждения города
  hideCityDialog(){
    this.mapService.hideChangeCityDialog()
  }

  //Открытие модалки для поиска городов
  isModalSearchCityesOpen(isOpen: boolean){
    this.modalSearchCityesOpen = isOpen
  }

  //Открытие модалки для поиска ивентов и достопримечательностей
  isModalSearchEventsOpen(isOpen: boolean){
    this.modalSearchEventsOpen = isOpen
  }

  //Получаем города из вк
  getCityes(event: any){
    if (event.target.value.length >= 3){
      this.cityesListLoading = true
      this.minLengthCityesListError = false
      this.vkService.serachCity(event.target.value).pipe(takeUntil(this.destroy$)).subscribe(response => {
        this.cityesList = response.response.items
        this.cityesListLoading = false
      })
    } else {
      this.minLengthCityesListError = true
    }
  }

  //Устанавливаем город, регион и координаты в локал сторадж и всервис
  onSelectedCity(item:any){  
    this.mapService.setCityTolocalStorage(item.title)
    this.mapService.setRegionTolocalStorage(item.region)
    //Получаем координаты по городу и записываем их
    this.mapService.ForwardGeocoder(item.title + '' + item.region).pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.mapService.setCityLatitudeTolocalStorage(value.geoObjects.get(0).geometry.getCoordinates()[0].toString())
      this.mapService.setCityLongitudeTolocalStorage(value.geoObjects.get(0).geometry.getCoordinates()[1].toString())
    })
    this.toastService.showToast(MessagesCityes.setCitySuccess, 'success')
  }

  //Получить ивенты
  getEvents(event: any){
    
    console.log(this.searchEvents.value)
    console.log(event.target.value)
    // this.searchCityes.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
    //   console.log('searchTerm ' + value)
    // })
  }

  //Выбираем ивент и переходим на него
  onSelectedEvent(item:any){

  }
  
  //Очистить поля поисков в модалках поиска горда и выбора ивента
  onClearSearch(){
    this.minLengthCityesListError = false
    this.minLengthEventsListError = false
    this.cityesList = []
    this.eventsList = []
  }

  ngOnInit() {

    //Смотрим состояние кнопки назад
    this.navigationServise.showBackButton.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.showBackButton = value
    })

    //Подписываемся на город
    this.mapService.city.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.city = value
    })

    //Подписываемся на город из Геолокации
    this.mapService.geolocationCity.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.geolocationCity = value
    })

     //Подписываемся на регион 
     this.mapService.region.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.region = value
    })

     //Подписываемся на регион из Геолокации
    this.mapService.geolocationRegion.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.geolocationRegion = value
    })

     //Подписываемся на изменение радиуса
    this.mapService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value)
    })

    //Показывать ли диалог о смене города
    this.mapService.showChangeCityDialog.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.showChangeCityDialog = value
      console.log('showChangeCityDialog ' +value)
    })
    
    //Формируем меню из файла
    this.menuPublic = menuPublicData

    //Capacitor.isNativePlatform() ? console.log('ипользуется мобильная версия') : console.log('ипользуется веб версия')
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }

}
