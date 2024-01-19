import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, catchError, of, EMPTY } from 'rxjs';
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenu } from 'src/app/models/menu';
import { environment } from 'src/environments/environment';
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
import { FilterService } from 'src/app/services/filter.service';
import { LocationService } from 'src/app/services/location.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';

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

  locationId:number = 0
  geolocationCity:string = ''
  showChangeCityDialog:boolean = false
  radius:number = 1
  region:string = ''
  city:string = ''
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
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private mapService: MapService,
    private vkService: VkService,
    private toastService: ToastService,
    private eventsService: EventsService,
    private sightsService: SightsService,
    private filterService: FilterService,
    private locationService: LocationService,
    ) { }

    getEventService() {
      return  this.filterService.eventsCount.value
    }

    getSightService() {
      return  this.filterService.sightsCount.value
    }

  //Установить город из диалога, из геопозиции
  setCityFromDialog(){
    this.city = this.geolocationCity
    this.region = this.geolocationRegion
    this.mapService.setCoordsFromChangeCityDialog()
    this.mapService.hideChangeCityDialog()
    this.toastService.showToast(MessagesCityes.setCitySuccess, 'success')
  }

  //Скрыть диалог подтверждения города
  hideCityDialog(){
    this.mapService.hideChangeCityDialog()
    this.navigationService.modalSearchCityesOpen.next(true)
  }

  //Открытие модалки для поиска городов
  isModalSearchCityesOpen(isOpen: boolean){
    this.onClearSearch()
    this.searchCityes.patchValue('')
    this.navigationService.modalSearchCityesOpen.next(isOpen)
  }

  //Открытие модалки для поиска ивентов и достопримечательностей
  isModalSearchEventsOpen(isOpen: boolean){
    this.onClearSearch()
    this.searchEvents.patchValue('')
    this.navigationService.modalSearchEventsOpen.next(isOpen)
  }

  //Получаем города
  getCityes(event: any){
    if (event.target.value.length >= 3){
      this.cityesListLoading = true
      this.minLengthCityesListError = false
      this.locationService.getLocationsName(event.target.value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.cityesList = response.locations
        this.cityesListLoading = false
      })
    } else {
      this.minLengthCityesListError = true
    }
  }

  //Устанавливаем город, регион и координаты в локал сторадж и в сервис
  onSelectedCity(item:any){
    console.log(item)
    this.city = item.name
    this.region = item.location_parent.name
    this.filterService.setLocationTolocalStorage(item.id)
    // this.filterService.setLocationLatitudeTolocalStorage(item.name)
    // this.filterService.setRegionTolocalStorage(item.location_parent.name)
    //Получаем координаты по городу и записываем их
    // this.mapService.ForwardGeocoder(item.name + '' + item.location_parent.name).pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.filterService.setLocationLatitudeTolocalStorage(item.latitude)
      this.filterService.setLocationLongitudeTolocalStorage(item.longitude)
    // })
    this.filterService.changeFilter.next(true)
    this.filterService.changeCityFilter.next(true)
    this.modalClose()
    this.toastService.showToast(MessagesCityes.setCitySuccess, 'success')
  }

  //Получить ивенты
  getEventsAndSights(event: any){
    if (event.target.value.length >= 3){
      this.eventsListLoading = true
      this.minLengthEventsListError = false
      this.queryParams =  {
        pagination: true,
        limit: 50,
        favoriteUser: true,
        likedUser: true,
        statuses: [Statuses.publish].join(','),
        statusLast: true,
        locationId: this.locationId,
        searchText: event.target.value
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
    this.navigationService.modalSearchCityesOpen.next(false)
    this.navigationService.modalSearchEventsOpen.next(false)
  }

  pinRadiusFormatter(value: number) {
    return `${value} км.`;
   }

  //Меняем радиус
  radiusChange(event:any){
    this.filterService.setRadiusTolocalStorage(event.detail.value)

  }

  ngOnInit() {

    //Смотрим состояние кнопки назад
    this.navigationService.showBackButton.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.showBackButton = value
    })

     //Подписываемся на состояние модалки поиска города
     this.navigationService.modalSearchCityesOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalSearchCityesOpen = value
    })

     //Подписываемся на состояние модалки поиска ивентов и мест
     this.navigationService.modalSearchEventsOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalSearchEventsOpen = value
    })

    //Подписываемся на город
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.locationId = value
      // Запрашиваем локацию по ид если меняется
      if(value){
        this.locationService.getLocationsIds(value).pipe().subscribe( value =>{
          this.city = value.location.name
          this.region = value.location.location_parent.name
        })
      }
    })

    //Подписываемся на город из Геолокации
    this.mapService.geolocationCity.pipe(takeUntil(this.destroy$)).subscribe(value => {
      //console.log('this.mapService.geolocationCity ',value)
      this.geolocationCity = value
    })

     //Подписываемся на регион из Геолокации
    this.mapService.geolocationRegion.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.geolocationRegion = value
    })

     //Подписываемся на изменение радиуса
    this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
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
