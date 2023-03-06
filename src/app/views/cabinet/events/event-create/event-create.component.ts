import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription, switchMap, tap, of, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { EventTypeService } from 'src/app/services/event-type.service';
//import { IUser } from 'src/app/models/user';
import { IEventType } from 'src/app/models/event-type';
import { environment } from 'src/environments/environment';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from 'src/app/services/map.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { MessagesLoading } from 'src/app/enums/messages-loading';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { dateRangeValidator } from 'src/app/validators/date-range.validators';
import { fileTypeValidator } from 'src/app/validators/file-type.validators';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
  animations: [
    trigger('fade', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate(
              '500ms ease-in',
              style({ opacity: 1 })
          ),
      ]),
      transition(':leave', [
            animate(
                '500ms ease-in',
                style({ opacity: 0 })
            ),
      ]),   
    ]),

  ]
})

export class EventCreateComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>()

  host: string = environment.BASE_URL
  port: string = environment.PORT
  
  user: any
  stepStart: number = 1
  stepCurrency: number = 1
  steps:number = 12
  vkGroups: any
  vkGroupSelected: number | null = null
  vkGroupPosts: any
  vkGroupPostsLoaded: boolean = false
  vkGroupPostsDisabled: boolean = false
  vkGroupPostSelected: any = null
  types: IEventType[] = []
  typesLoaded: boolean = false
  typeSelected: number | null = null

  uploadFiles: string[] = []
  formData: FormData = new FormData()
  imagesPreview: string[] = []

  //nextButtonDisable: boolean = false

  placemark!: ymaps.Placemark
  map!:YaReadyEvent<ymaps.Map>
 
  createEventForm: FormGroup = new FormGroup({})

  constructor(
    private loadingService: LoadingService, 
    private toastService: ToastService, 
    private userService: UserService, 
    private eventTypeService: EventTypeService, 
    private mapService: MapService, 
    private yaGeocoderService: YaGeocoderService) { }
   
  //поулчаем юзера и устанвлвиаем группы и шаги
  getUserWithSocialAccount(){
    this.userService.getUser().pipe(
      tap(() => {
        this.loadingService.showLoading(MessagesLoading.vkGroupSearch)
      }),
      switchMap((user: any) => {
        this.user = user
        this.createEventForm.patchValue({ sponsor: user?.name })
        return of(user)
      }),
      switchMap((user: any) => {
        if(!user?.social_account){
          this.toastService.showToast(MessagesErrors.vkGroupSearch, 'secondary')   
        } else {
          // this.getVkGroups(user.social_account.provider_id, user.social_account.token)
          return this.userService.getVkGroups(user.social_account.provider_id, user.social_account.token).pipe(
            switchMap((response: any) => {
              this.setVkGroups(response?.response.items)
              return of([])  
            }),
          )
        } 
        return of([])  
      }),
      tap(() => {
        this.setSteps()  
      }),
      tap(() => {
        this.loadingService.hideLoading()  
      }),
      takeUntil(this.destroy$)  
    ).subscribe();
  }

  //Устнавливаем группы
  setVkGroups(items: any){
    if(items){
      this.vkGroups = items
    } else {
      this.vkGroups = []
      this.toastService.showToast(MessagesErrors.vkGroupSearch, 'secondary')
    }
  }

  //Устанавливаем шаги
  setSteps(){
    if(this.vkGroups){
      this.stepStart = 1
      this.stepCurrency = 1
    } else {
      this.stepStart = 3
      this.stepCurrency = 3
      //this.nextButtonDisable = true
    }
  }

  //Выбираем группу
  selectedVkGroup(group_id: any){
    if (group_id.detail.value) {
      this.vkGroupSelected = group_id.detail.value 
      this.setVkPostsByGroupID(group_id.detail.value )
    } else {
      this.vkGroupSelected =  null
      this.vkGroupPosts = null
    }
  }

  //Грузим посты по ИД группы
  setVkPostsByGroupID(group_id: number){
    this.userService.getVkPostsGroup(group_id, 10, this.user.social_account.token).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.vkGroupPosts = response.response
      console.log(response.response)
      response.response ? this.vkGroupPostsLoaded = true :  this.vkGroupPostsLoaded = false //для скелетной анимации
    })
  }

  //Выбираем пост
  selectedVkGroupPost(post: any){
    if(!post || this.vkGroupPostSelected?.id === post.id){
      this.vkGroupPostSelected = null
      this.createEventForm.patchValue({description: '' });
    } else {
      this.vkGroupPostSelected = post
      this.createEventForm.patchValue({description: this.vkGroupPostSelected.text });
    }
  }

  //Получаем типы мероприятий
  getTypes(){
    this.eventTypeService.geTypes().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
    })
  }
  
  //Выбор типа
  selectedType(type_id: any){
    type_id.detail.value ? this.typeSelected = type_id.detail.value  :  this.typeSelected =  null
  }

  //При клике ставим метку, если метка есть, то перемещаем ее
  onMapClick(e: YaEvent<ymaps.Map>): void {
    const { target, event } = e;
    this.createEventForm.patchValue({coords: [event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)] })
    // this.createEventForm.value.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    this.map.target.geoObjects.removeAll()
    this.placemark= new ymaps.Placemark(this.createEventForm.value.coords)
    this.map.target.geoObjects.add(this.placemark)
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(this.createEventForm.value.coords, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      this.createEventForm.value.search = firstGeoObject.getAddressLine()

    })
  }
 
  // Поиск по улицам
  onMapReady(e: YaReadyEvent<ymaps.Map>): void {
    this.map = e;

    if (this.createEventForm.value.coords){
      this.map.target.geoObjects.removeAll()
      this.placemark= new ymaps.Placemark(this.createEventForm.value.coords)
      this.map.target.geoObjects.add(this.placemark)
      this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
      this.map.target.setZoom(17)
    } else {
      this.mapService.geolocationMap(this.map);
    }
    
    const search = new ymaps.SuggestView('search-map');  
    search.events.add('select',()=>{      
      this.addPlacemark()
    })
  }

  //При выборе из выпадающего списка из поиска создает метку по адресу улицы
  addPlacemark(): void{
    this.createEventForm.value.search=(<HTMLInputElement>document.getElementById("search-map")).value
    const geocodeResult = this.yaGeocoderService.geocode(this.createEventForm.value.search, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      try {
        const firstGeoObject = result.geoObjects.get(0);

        this.map.target.geoObjects.removeAll()
        this.placemark= new ymaps.Placemark(firstGeoObject.geometry.getCoordinates())
        this.map.target.geoObjects.add(this.placemark)
        // this.createEventForm.value.coords=this.placemark.geometry?.getCoordinates()
        this.createEventForm.patchValue({coords: this.placemark.geometry?.getCoordinates()})
        //центрирование карты по метки и установка зума
        this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
        this.map.target.setZoom(17)
       // this.disabledNextButton()
      } catch (error) { 
        
      }
    }) 
  }

  //очистка поиска на карте
  clearSearche(event:any){
    if (event.detail.value == 0){
      this.createEventForm.patchValue({coords: []})
      this.placemark= new ymaps.Placemark([])
      this.map.target.geoObjects.removeAll() 
    }
  }

  //Загрузка фото
  onFileChange(event: any) {
    this.imagesPreview = [] // очищаем превьюшки
    this.uploadFiles = [] // очишщаем массив с фотками
    this.formData.delete('files[]') // очишщаем форм дату

    for (var i = 0; i < event.target.files.length; i++) {
      this.uploadFiles.push(event.target.files[i])
    }

    this.createImagesPreview()  
  }

  //Удалить прею фотки
  deleteFile(img: string){
    this.imagesPreview = this.imagesPreview.filter((a) => a !== img);
  }

  //заполнем превью фоток 
  createImagesPreview(){
    if(this.uploadFiles && !this.createEventForm.controls['files'].hasError('requiredFileType')){
      this.loadingService.showLoading()
      this.uploadFiles.forEach((file: any) => {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.imagesPreview.push(reader.result as string) 
        }
      }) 
      this.loadingService.hideLoading()
    }
  }

//формируем дату для отправки на сервер
  createFormDataImages(){
    if(this.uploadFiles && !this.createEventForm.controls['files'].hasError('requiredFileType')){
      for (var i = 0; i < this.uploadFiles.length; i++) {
        this.formData.append('files[]', this.uploadFiles[i]);
      }
    }
  }
  
  //Клик по кнопке веперед
  stepNext(){
    if(this.stepCurrency !== this.steps){
      this.vkGroupPostSelected && this.stepCurrency === 3 ? this.stepCurrency = this.stepCurrency + 3 : this.stepCurrency++
     // this.disabledNextButton()
    }   
  }

  //Клик по нкопке назад
  stepPrev(){
    if(this.stepCurrency !== this.stepStart){
      this.vkGroupPostSelected && this.stepCurrency === 6 ? this.stepCurrency = this.stepCurrency - 3 : this.stepCurrency--
     // this.disabledNextButton()
    }   
  }

  //Клик по шагу в баре
  goToStep(step: number){
    if(this.stepCurrency !== step){
      this.stepCurrency = step
      //this.disabledNextButton()
      this.stepIsValid()
    }   
  }

  //Блокировка шагов в баре
  stepIsValid(step:number = this.stepStart){
    switch (step) {
      case 1:
      case 2:
        return true
      case 3:
        return this.createEventForm.controls['name'].invalid  ?  false :  true
      case 4:
        return this.createEventForm.controls['description'].invalid  ? false :  true 
      case 6:
        return this.createEventForm.hasError('dateInvalid') ?  false :  true
      case 7:
        return this.createEventForm.controls['sponsor'].invalid  ?  false :  true      
      case 9:
        return !this.createEventForm.controls['coords'].value.length ? false :  true  
      default:
        return true
    }
  }

  //Проверка шагов и блокировка \ разблокировка кнопок далее \ назад
  // disabledNextButton(){  
  //   switch (this.stepCurrency) {
  //     case 1:
  //     case 2:
  //     // case 10:
  //     // case 11:
  //     // case 12:
  //      this.nextButtonDisable = false
  //       break
  //     case 3:
  //      this.createEventForm.controls['name'].invalid  ? this.nextButtonDisable = true : this.nextButtonDisable = false
  //       break 
  //     case 4:
  //       this.createEventForm.controls['description'].invalid  ? this.nextButtonDisable = true : this.nextButtonDisable = false
  //       break 
  //     case 6:
  //       this.createEventForm.hasError('dateInvalid') ? this.nextButtonDisable = true : this.nextButtonDisable = false
  //       break 
  //     case 7:
  //       this.createEventForm.controls['sponsor'].invalid  ? this.nextButtonDisable = true : this.nextButtonDisable = false
  //       break    
  //     case 9:
  //       !this.createEventForm.controls['coords'].value.length ? this.nextButtonDisable = true : this.nextButtonDisable = false
  //       break  
  //     default:
  //       break
  //   }
  // }

  //Отпрвка формы
  onSubmit(){
    console.log('submit')
    this.createFormDataImages()
  }

  ngOnInit() {
    //Создаем поля для формы
    this.createEventForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('',[Validators.required, Validators.minLength(10)]),
      search: new FormControl('',[Validators.required]),
      coords: new FormControl('',[Validators.required, Validators.minLength(2)]), 
      type:  new FormControl({value: '1', disabled: false},[Validators.required]),
      status:  new FormControl({value: '1', disabled: false},[Validators.required]),
      files: new FormControl('',fileTypeValidator(['png','jpg','jpeg'])),
      price: new FormControl(''),
      materials: new FormControl(''),
      dateStart: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [Validators.required]),
      dateEnd: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [Validators.required]),
    },[dateRangeValidator]);

    this.getUserWithSocialAccount()
    this.getTypes()
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
