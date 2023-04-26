import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IEventType } from 'src/app/models/event-type';
import { ISightType } from 'src/app/models/sight-type';
import { EventTypeService } from 'src/app/services/event-type.service';
import { FilterService } from 'src/app/services/filter.service';
import { MapService } from 'src/app/services/map.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { SightTypeService } from 'src/app/services/sight-type.service';
import { VkService } from 'src/app/services/vk.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  modalFiltersOpen:boolean = false

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT
  eventTypes: IEventType[] = []
  sightTypes: ISightType[] = []
  eventTypesLoding: boolean = false
  sightTypesLoding: boolean = false

  segment:string = 'start'

  minLengthCityesListError:boolean = false
  cityesList: any[] = [];
  cityesListLoading:boolean = false
  searchCityes: FormControl =  new FormControl('')
  
  dateFiltersSelected:boolean = false
  //saveFilters?: number = 1
  countFilters: number = 0
  startDate?: string
  endDate?: string
  eventTypesFilter?: number[] 
  sightTypesFilter?: number[]
  radius: number = 1  
  city:string = ''
  region: string = ''
  nowDate: string = new Date().toISOString()
  minDate: string = new Date().toISOString()
  maxDate?: string

  constructor(
    private eventTypeService: EventTypeService, 
    private sightTypeService: SightTypeService, 
    private filterService: FilterService, 
    private vkService: VkService,
    private mapService: MapService,
    private navigationService: NavigationService
  ) { }

  getEventTypes(){
    this.eventTypesLoding = true
    this.eventTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.eventTypes = response.types
      this.eventTypesLoding = false
    })
  }

  getSightTypes(){
    this.sightTypesLoding = true
    this.sightTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.sightTypes = response.types
      this.sightTypesLoding = false
    })
  }

  // toggleSaveFilter(){
  //   this.saveFilters === 1 ? this.filterService.setSaveFiltersTolocalStorage(0) : this.filterService.setSaveFiltersTolocalStorage(1)
  // }

  onSegmentChanged(event:any){
    this.segment = event.detail.value
  }

  startDateChange(event:any){
    this.filterService.setStartDateTolocalStorage(event.detail.value)
    this.dateFiiltersCounter()
    this.minDate = new Date(event.detail.value).toISOString()
  }

  endDateChange(event:any){
    this.filterService.setEndDateTolocalStorage(event.detail.value)
    this.dateFiiltersCounter()
    this.maxDate = new Date(event.detail.value).toISOString()
  }

  //Добавляем в массив выбраных ивентов
  eventTypesChange(typeId: number){
    if (!this.eventTypesFilter?.includes(typeId)) {
      this.eventTypesFilter?.push(typeId)
      this.filterService.setCountFiltersTolocalStorage(++this.countFilters) 
    } else {
      this.eventTypesFilter = this.eventTypesFilter.filter((id) => id !== typeId)
      if (this.countFilters !== 0){
        this.filterService.setCountFiltersTolocalStorage(--this.countFilters) 
      }  
    }
    this.filterService.setEventTypesTolocalStorage(this.eventTypesFilter) // записваем иассив в сервис
    this.filterService.changeFilter.next(true)
  }

  //Проверяем выбран ли ивент, чтобы чекнуть чекбокс
  onCheckedEventType(typeId: number){
    if (this.eventTypesFilter && this.eventTypesFilter.length){
      return this.eventTypesFilter.includes(typeId)
    }
    return false
  }

  //Добавляем в массив выбраных мест
  sightTypesChange(typeId: number){
    if (!this.sightTypesFilter?.includes(typeId)) {
      this.sightTypesFilter?.push(typeId)
      this.filterService.setCountFiltersTolocalStorage(++this.countFilters) 
    } else {
      this.sightTypesFilter = this.sightTypesFilter.filter((id) => id !== typeId)
      if (this.countFilters !== 0)
        this.filterService.setCountFiltersTolocalStorage(--this.countFilters) 
    }
    this.filterService.setSightTypesTolocalStorage(this.sightTypesFilter) // записваем иассив в сервис
    this.filterService.changeFilter.next(true)
  }

  //Проверяем выбран ли ивент, чтобы чекнуть чекбокс
  onCheckedSightType(typeId: number){
    if (this.sightTypesFilter && this.sightTypesFilter.length){
      return this.sightTypesFilter.includes(typeId)
    }
    return false
  }

  //Если обе даты выбраны ставим тру
  dateFiiltersCounter(){
    if (this.startDate && this.endDate && !this.dateFiltersSelected){
      //this.dateFiltersSelected = true
      this.filterService.dateFiltersSelected.next(true)
    }

    if (this.startDate && this.endDate){ // если выбраны обе даты, то кидает изменение фильтра
      this.filterService.changeFilter.next(true)   
    }
     
  }

  //Удаляем фильтры
  removeFilter(){ 
    //this.dateFiltersSelected = false // чтобы сбросить счетчик даты
    this.minDate = new Date().toISOString()
    this.filterService.changeFilter.next(false) 
    this.filterService.removeFilters()
    if (!this.navigationService.appFirstLoading.value)
      this.filterService.changeFilter.next(true)
  }

  //Показывамем километраж при перетаскивании пина в выборе радиуса
  pinRadiusFormatter(value: number) {
    return `${value} км.`;
   }

  //Меняем радиус
  radiusChange(event:any){
    this.filterService.setRadiusTolocalStorage(event.detail.value)
    this.filterService.changeFilter.next(true)
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
    this.filterService.setCityTolocalStorage(item.title)
    item.region ? this.filterService.setRegionTolocalStorage(item.region) : this.filterService.setRegionTolocalStorage(item.title)
    //Получаем координаты по городу и записываем их
    this.mapService.ForwardGeocoder(item.title + '' + item.region).pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.filterService.setCityLatitudeTolocalStorage(value.geoObjects.get(0).geometry.getCoordinates()[0].toString())
      this.filterService.setCityLongitudeTolocalStorage(value.geoObjects.get(0).geometry.getCoordinates()[1].toString())
    })
    this.filterService.changeFilter.next(true)
    this.filterService.changeCityFilter.next(true)
  }

   //Очистить поле поиса в поиске города
   onClearSearch(){
    this.minLengthCityesListError = false
    this.cityesListLoading = false
    this.cityesList = []
  }

  //Открытие модалки с фильтрами
  isModalFilterOpen(isOpen: boolean){
    this.onClearSearch()
    this.searchCityes.patchValue('')
    this.navigationService.modalFiltersOpen.next(isOpen)
  }

  modalClose(){
    this.navigationService.modalFiltersOpen.next(false)
  }

  ngOnInit() {
    this.getEventTypes()
    this.getSightTypes()

    //Сбрасываем фильтры даты
    //this.filterService.removeDateFilters()

    //Подписываемся на состояние модалки фильтров
    this.navigationService.modalFiltersOpen.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.modalFiltersOpen = value
    })

    //подписываемся на сохранение фильтров
    // this.filterService.saveFilters.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   this.saveFilters = value
    // })

    //подписываемся флаг выбора даты
    this.filterService.dateFiltersSelected.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.dateFiltersSelected = value
    })

    //Сбрасываем фильтры, если у юзера было установлено не сохранять фильтры - перенес в app.ts
    // if (this.saveFilters === 0)
    //     this.removeFilter()

    //подписываемся на кол-во фильтров
    this.filterService.countFilters.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.countFilters = value
    })

    //подписываемся на дату начала
    this.filterService.startDate.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.startDate = value
      console.log(this.startDate)
    })

    //подписываемся на дату конца
    this.filterService.endDate.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.endDate = value
    })

    //подписываемся на типы мероприятияй
    this.filterService.eventTypes.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.eventTypesFilter = value
    })

    //подписываемся на типы достопримечательностей
    this.filterService.sightTypes.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.sightTypesFilter = value
    }) 

     //Подписываемся на изменение радиуса
     this.filterService.radius.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.radius = parseInt(value)
    })

    //Подписываемся на город
    this.filterService.city.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.city = value
    })

    //Подписываемся на регион 
    this.filterService.region.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.region = value
    })
    
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }

}
