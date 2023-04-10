import { Component, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { Subject, takeUntil, catchError, of, EMPTY } from 'rxjs';
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
import { EventsService } from 'src/app/services/events.service';
import { IGetEventsAndSights } from 'src/app/models/getEventsAndSights';
import { Statuses } from 'src/app/enums/statuses';
import { SightsService } from 'src/app/services/sights.service';
import { MessagesErrors } from 'src/app/enums/messages-errors';

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

  segment:string = 'events'

  cityesList: any[] = [];
  cityesListLoading:boolean = false
  searchCityes: FormControl =  new FormControl('')
  eventsListLoading:boolean = false
  eventsList: any[] = [];
  sightsListLoading:boolean = false
  sightsList: any[] = [];
  searchEvents: FormControl =  new FormControl('')

  queryParams?: IGetEventsAndSights 

  constructor(
    private navigationServise: NavigationService, 
    private mapService: MapService, 
    private vkService: VkService,
    private toastService: ToastService,
    private eventsService: EventsService,
    private sightsService: SightsService
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
    this.onClearSearch()
    this.searchCityes.patchValue('')
    //this.modalSearchCityesOpen = isOpen
    this.navigationServise.modalSearchCityesOpen.next(isOpen)
  }

  //Открытие модалки для поиска ивентов и достопримечательностей
  isModalSearchEventsOpen(isOpen: boolean){
    this.onClearSearch()
    this.searchEvents.patchValue('')
    //this.modalSearchEventsOpen = isOpen
    this.navigationServise.modalSearchEventsOpen.next(isOpen)
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
    item.region ? this.mapService.setRegionTolocalStorage(item.region) : this.mapService.setRegionTolocalStorage(item.title)
    //Получаем координаты по городу и записываем их
    this.mapService.ForwardGeocoder(item.title + '' + item.region).pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.mapService.setCityLatitudeTolocalStorage(value.geoObjects.get(0).geometry.getCoordinates()[0].toString())
      this.mapService.setCityLongitudeTolocalStorage(value.geoObjects.get(0).geometry.getCoordinates()[1].toString())
    })
    this.toastService.showToast(MessagesCityes.setCitySuccess, 'success')
  }

  //Получить ивенты
  getEventsAndSights(event: any){  
    if (event.target.value.length >= 3){
      this.eventsListLoading = true
      this.minLengthEventsListError = false
      this.queryParams =  {
        pagination: true,
        page: 1,
        limit: 50,
        favoriteUser: true,
        likedUser: true,
        statuses: [Statuses.publish].join(','),
        statusLast: true,
        city: this.city,
        searchText: event.target.value
        //latitude: [50.84330000000000,70.84330000000000].join(','),
        //longitude:[50.84330000000000,70.84330000000000].join(',')
      }

      this.eventsService.getEvents(this.queryParams).pipe(
        catchError((err) =>{
          this.eventsListLoading = false
          this.toastService.showToast(MessagesErrors.default, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
        ).subscribe((response:any) => {
        this.eventsList = response.events.data
        this.eventsListLoading = false
      })

      this.sightsService.getSights(this.queryParams).pipe(
        catchError((err) =>{
          this.sightsListLoading = false
          this.toastService.showToast(MessagesErrors.default, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
        ).subscribe((response:any) => {
        this.sightsList = response.sights.data
        this.sightsListLoading = false
      })
    } else {
      this.minLengthEventsListError = true
    }
  }

  //Выбираем ивент и переходим на него
  // onSelectedEvent(item:any){

  // }

  onSegmentChanged(event:any){
    this.segment = event.detail.value
  }
  
  //Очистить поля поисков в модалках поиска горда и выбора ивента
  onClearSearch(){
    this.minLengthCityesListError = false
    this.minLengthEventsListError = false
    this.cityesListLoading = false
    this.eventsListLoading = false
    this.sightsListLoading = false
    this.cityesList = []
    this.eventsList = []
    this.sightsList = []
  }

  modalClose(){
    this.navigationServise.modalSearchCityesOpen.next(false)
    this.navigationServise.modalSearchEventsOpen.next(false)
  }

  ngOnInit() {

    //Смотрим состояние кнопки назад
    this.navigationServise.showBackButton.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.showBackButton = value
    })

     //Подписываемся на состояние модалки поиска города
     this.navigationServise.modalSearchCityesOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalSearchCityesOpen = value
    })

     //Подписываемся на состояние модалки поиска ивентов и мест
     this.navigationServise.modalSearchEventsOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalSearchEventsOpen = value
    })

    //Подписываемся на город
    this.mapService.city.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.city = value
    })

    //Подписываемся на город из Геолокации
    this.mapService.geolocationCity.pipe(takeUntil(this.destroy$)).subscribe(value => {
      //console.log('this.mapService.geolocationCity ',value)
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
