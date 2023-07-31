import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { switchMap, tap, of, Subject, takeUntil, catchError } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { EventTypeService } from 'src/app/services/event-type.service';
//import { IUser } from 'src/app/models/user';
import { IEventType } from 'src/app/models/event-type';
import { IStatus } from 'src/app/models/status';
import { environment } from 'src/environments/environment';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from 'src/app/services/map.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { MessagesLoading } from 'src/app/enums/messages-loading';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { Statuses } from 'src/app/enums/statuses';
import { dateRangeValidator } from 'src/app/validators/date-range.validators';
import { fileTypeValidator } from 'src/app/validators/file-type.validators';
import { EventsService } from 'src/app/services/events.service';
import { MessagesEvents } from 'src/app/enums/messages-events';
import { Capacitor } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { StatusesService } from 'src/app/services/statuses.service';
import { VkService } from 'src/app/services/vk.service';

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

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT
  
  user: any
  stepStart: number = 1
  stepCurrency: number = 1
  steps:number = 12
  vkGroups: any
  //Создать переменную для постов со страницы
  vkGroupSelected: number | null = null
  vkGroupPosts: any
  vkGroupPostsLoaded: boolean = false
  vkGroupPostsDisabled: boolean = false
  vkGroupPostSelected: any = null
  types: IEventType[] = []
  typesLoaded: boolean = false
  typeSelected: number | null = null
  statuses: IStatus[] = []
  statusesLoaded: boolean = false
  statusSelected: number | null = null
  city:string  = 'Заречный'
  uploadFiles: string[] = []
  formData: FormData = new FormData()
  imagesPreview: string[] = []

  //nextButtonDisable: boolean = false

  placemark!: ymaps.Placemark
  map!:YaReadyEvent<ymaps.Map>
 
  createEventForm: FormGroup = new FormGroup({})

  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private loadingService: LoadingService, 
    private toastService: ToastService, 
    private userService: UserService, 
    private vkService: VkService, 
    private eventTypeService: EventTypeService, 
    private statusesService: StatusesService, 
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
          return this.vkService.getGroups().pipe(
            switchMap((response: any) => {
              response?.response.items ? this.setVkGroups(response?.response.items) : this.setVkGroups([])
              return of(EMPTY) 
            }),
            catchError((err) =>{
              //Выкидываем на логин если с ВК проблемы
              this.toastService.showToast(err.error?.message || err.error?.error_msg || MessagesErrors.vkTokenError, 'danger')
              this.loadingService.hideLoading()
              this.authService.logout()
              return of(EMPTY) 
            })
          )
        } 
        return of(EMPTY) 
      }),
      tap(() => {
        this.setSteps()  
      }),
      tap(() => {
        this.loadingService.hideLoading()  
      }),
      catchError((err) =>{
        this.toastService.showToast(err.error?.message || err.error?.error_msg || MessagesErrors.default, 'danger')
        this.loadingService.hideLoading()
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)  
    ).subscribe();
  }

  //Устанавливаем группы
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
    this.vkService.getPostsGroup(group_id, 10).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.vkGroupPosts = response.response
      console.log(this.vkGroupPosts)
      response.response ? this.vkGroupPostsLoaded = true :  this.vkGroupPostsLoaded = false //для скелетной анимации
    })
  }

  // getVideo(owner_id: number, video_id: number) {
  //   let vid = this.vkService.getVideo(owner_id, video_id)
  //   console.log(vid)
  //   return vid
  // }
  //Выбираем пост
  selectedVkGroupPost(post: any){
    if(!post || this.vkGroupPostSelected?.id === post.id){
      this.vkGroupPostSelected = null
      this.createEventForm.patchValue({description: '' });
      this.resetUploadInfo()
    } else {
      this.vkGroupPostSelected = post
      this.createEventForm.patchValue({description: this.vkGroupPostSelected.text });
    }
  }

  //Получаем типы мероприятий
  getTypes(){
    this.eventTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
    })
  }
  
  //Выбор типа
  selectedType(type_id: any){
    type_id.detail.value ? this.typeSelected = type_id.detail.value  :  this.typeSelected =  null
  }

  //Получаем статусы и устанавливаем статус по умолчанию
  getStatuses(){
    this.statusesService.getStatuses().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.statuses = response.statuses
      if (response.statuses){
        response.statuses.forEach((status:IStatus) => {
          if (status.name === Statuses.moderation){
            this.statusSelected = status.id
            this.createEventForm.patchValue({ status: status.id })
          }
        })
        this.statusesLoaded = true //для скелетной анимации
      } else {
        this.statusesLoaded = false
      }  
    })
  }

  //Выбор типа
  selectedStatus(status_id: any){
    status_id.detail.value ? this.statusSelected = status_id.detail.value  :  this.statusSelected =  null
  }

  //При клике ставим метку, если метка есть, то перемещаем ее
  async onMapClick(e: YaEvent<ymaps.Map>) {
    const { target, event } = e;
    this.createEventForm.patchValue({coords: [event.get('coords')[0], event.get('coords')[1]] })
    // this.createEventForm.value.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    this.map.target.geoObjects.removeAll()
    this.placemark= new ymaps.Placemark(this.createEventForm.value.coords)
    this.map.target.geoObjects.add(this.placemark)
    if (!Capacitor.isNativePlatform())  {
      this.ReserveGeocoder()
    } else {
      // this.createEventForm.value.address =await this.mapService.ReserveGeocoderNative(this.createEventForm.value.coords).then(res=>{console.log("res "+res)})
      this.ReserveGeocoder()
    }
  }
 
   // Поиск по улицам
   onMapReady(e: YaReadyEvent<ymaps.Map>) {
    this.map = e;
    if (this.createEventForm.value.coords){     
      this.addPlacemark(this.createEventForm.value.coords)
    } else {
      this.mapService.geolocationMapNative(this.map);
    }
    
    const search = new ymaps.SuggestView('search-map');  
    search.events.add('select',()=>{     
    if (!Capacitor.isNativePlatform())  {
      this.ForwardGeocoder()
    } else {
      // this.createEventForm.value.address=(<HTMLInputElement>document.getElementById("search-map")).value
      // let coords = this.mapService.ForwardGeocoderNative(this.createEventForm.value.address)
      // this.addPlacemark(coords!)
      this.ForwardGeocoder()
    }
    })
  }

  //При выборе из выпадающего списка из поиска создает метку по адресу улицы
  addPlacemark(coords: number[]){
    try {
      this.map.target.geoObjects.removeAll()
      this.placemark= new ymaps.Placemark(coords)
      this.map.target.geoObjects.add(this.placemark)
      // this.createEventForm.value.coords=this.placemark.geometry?.getCoordinates()
      this.createEventForm.patchValue({coords: this.placemark.geometry?.getCoordinates()})
      //центрирование карты по метки и установка зума
      this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
      this.map.target.setZoom(17)
    } catch (error) {

    }
  }

  ReserveGeocoder(): void{
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(this.createEventForm.value.coords, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      
      this.city=firstGeoObject.getLocalities(0)[0]

      this.createEventForm.value.address = firstGeoObject.getAddressLine()
    })
  }

  ForwardGeocoder(): void{
    this.createEventForm.value.address=(<HTMLInputElement>document.getElementById("search-map")).value
    const geocodeResult = this.yaGeocoderService.geocode(this.createEventForm.value.address, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {

      const firstGeoObject = result.geoObjects.get(0);
      this.addPlacemark(firstGeoObject.geometry.getCoordinates())

      this.city=firstGeoObject.getLocalities(0)[0]

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
    this.resetUploadInfo()

    for (var i = 0; i < event.target.files.length; i++) {
      this.uploadFiles.push(event.target.files[i])
    }

    this.createEventForm.patchValue({files: ''}) // Если не обнулять будет ошибка

    this.createImagesPreview()  
  }

  resetUploadInfo(){
    this.imagesPreview = [] // очищаем превьюшки
    this.uploadFiles = [] // очишщаем массив с фотками
    this.formData.delete('localFiles[]') // очишщаем файлы
    this.formData.delete('vkFiles[]') // очишщаем файлы
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
  createFormData(){
    if(this.uploadFiles && !this.createEventForm.controls['files'].hasError('requiredFileType')){
      for (var i = 0; i < this.uploadFiles.length; i++) {
        this.formData.append('localFiles[]', this.uploadFiles[i])
      }
    } 

    if(this.vkGroupPostSelected?.attachments.length){
      this.vkGroupPostSelected.attachments.forEach((attachment: any) => {
        let photo = attachment.photo.sizes.pop() //берем последний размер
        this.formData.append('vkFiles[]', photo.url)
      }) 
    } 

    this.formData.append('name', this.createEventForm.controls['name'].value)
    this.formData.append('sponsor', this.createEventForm.controls['sponsor'].value)
    this.formData.append('description', this.createEventForm.controls['description'].value)
    this.formData.append('coords', this.createEventForm.controls['coords'].value)
    this.formData.append('address', this.createEventForm.controls['address'].value)
    this.formData.append('city', this.city)
    this.formData.append('type', this.createEventForm.controls['type'].value)
    this.formData.append('status', this.createEventForm.controls['status'].value)
    this.formData.append('price', this.createEventForm.controls['price'].value)
    this.formData.append('materials', this.createEventForm.controls['materials'].value)
    this.formData.append('dateStart', this.createEventForm.controls['dateStart'].value)
    this.formData.append('dateEnd', this.createEventForm.controls['dateEnd'].value)
    this.formData.append('vkPostId', this.vkGroupPostSelected?.id ? this.vkGroupPostSelected?.id : null)
    // if (this.vkGroupPostSelected?.likes.count){
    //   this.formData.append('vkLikesCount', this.vkGroupPostSelected?.likes.count)
    // }
    if  (this.vkGroupSelected && this.vkGroupPostSelected?.id){
      this.formData.append('vkGroupId', this.vkGroupSelected.toString())
    }

    return this.formData
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
        //return !this.createEventForm.controls['coords'].value.length ? false :  true  
        return this.createEventForm.controls['coords'].invalid ? false :  true 
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
    let event = this.createFormData() // собираем формдату
    this.createEventForm.disable()
    this.loadingService.showLoading()
    this.eventsService.create(event).pipe(
      tap((res) => {
        this.loadingService.hideLoading()
        this.toastService.showToast(MessagesEvents.create, 'success')
        //this.createEventForm.reset()
        this.resetUploadInfo()
        this.vkGroupPostSelected = null
        this.createEventForm.controls['name'].reset()
        this.createEventForm.controls['description'].reset()
        this.createEventForm.controls['address'].reset()
        this.createEventForm.controls['coords'].reset()
        this.createEventForm.controls['files'].reset()
        this.createEventForm.controls['price'].reset()
        this.createEventForm.controls['materials'].reset()
        this.city = ''
        //this.createEventForm.controls['dateStart'].reset()
        //this.createEventForm.controls['dateEnd'].reset()
        this.createEventForm.enable()
        this.stepCurrency =  this.stepStart 
      }),
      catchError((err) =>{
        this.toastService.showToast(err.error.message || MessagesErrors.default, 'danger')
        this.createEventForm.enable()
        this.loadingService.hideLoading()
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  ngOnInit() {
    //Создаем поля для формы
    this.createEventForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('',[Validators.required, Validators.minLength(10)]),
      address: new FormControl('',[Validators.required]),
      coords: new FormControl('',[Validators.required, Validators.minLength(2)]), 
      type:  new FormControl({value: '1', disabled: false},[Validators.required]),
      status:  new FormControl({value: this.statusSelected, disabled: false},[Validators.required]),
      files: new FormControl('',fileTypeValidator(['png','jpg','jpeg'])),
      price: new FormControl('',[Validators.maxLength(6)]),
      materials: new FormControl(''),
      dateStart: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [Validators.required]),
      dateEnd: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [Validators.required]),
    },[dateRangeValidator])

    this.getUserWithSocialAccount()
    this.getTypes()
    this.getStatuses()
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
