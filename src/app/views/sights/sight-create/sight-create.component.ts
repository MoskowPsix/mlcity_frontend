import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core'
import { trigger, style, animate, transition } from '@angular/animations'
import { switchMap, tap, of, Subject, takeUntil, catchError, delay, retry, map } from 'rxjs'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { UserService } from 'src/app/services/user.service'
import { SightTypeService } from 'src/app/services/sight-type.service'
//import { IUser } from 'src/app/models/user';
import { ISightType } from 'src/app/models/sight-type'

import { IStatus } from 'src/app/models/status'
import { environment } from 'src/environments/environment'
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps'
import { MapService } from 'src/app/services/map.service'
import { LoadingService } from 'src/app/services/loading.service'
import { ToastService } from 'src/app/services/toast.service'
import { MessagesLoading } from 'src/app/enums/messages-loading'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { Statuses } from 'src/app/enums/statuses'
import { dateRangeValidator } from 'src/app/validators/date-range.validators'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
import { SightsService } from 'src/app/services/sights.service'
import { MessagesSights } from 'src/app/enums/messages-sights'
import { Capacitor } from '@capacitor/core'
import { AuthService } from 'src/app/services/auth.service'
import { EMPTY } from 'rxjs/internal/observable/empty'
import { StatusesService } from 'src/app/services/statuses.service'
import { VkService } from 'src/app/services/vk.service'
import { DomSanitizer } from '@angular/platform-browser'
import { register } from 'swiper/element/bundle'
import { LocationService } from 'src/app/services/location.service'
import { Location } from '@angular/common'

import { FilterService } from 'src/app/services/filter.service'
import { Router } from '@angular/router'
import { GeneratePlugSightEventsImgService } from 'src/app/services/generate-plug-sight-events-img.service'
@Component({
  selector: 'app-sight-create',
  templateUrl: './sight-create.component.html',
  styleUrls: ['./sight-create.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('500ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('500ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class SightCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  inputValue: string = ''
  user: any
  currentType: any = []
  stepStart: number = 0
  stepCurrency: number = 1
  steps: number = 5

  @ViewChild('sightName') sightNameElement!: any
  @ViewChild('sightDescription') sightDescriptionElement!: any
  @ViewChild('plug', { static: true }) plug!: ElementRef
  vkGroups: any
  //Создать переменную для постов со страницы
  vkGroupSelected: number | null = null
  vkGroupPosts: any
  vkGroupPostsLoaded: boolean = false
  vkGroupPostsDisabled: boolean = false
  vkGroupPostSelected: any = null
  types: ISightType[] = []
  typesLoaded: boolean = false
  vkFiles: any[] = []
  checkSocialVk: boolean = false
  typeSelected: number | null = null
  statuses: IStatus[] = []
  openModalPostValue: boolean = false
  allFiles: any[] = []
  openModalPostCount: number = 0
  cancelConfirmValue: boolean = false
  openModalGroupValue: boolean = false
  vkGroupModalSelected: any = 0
  statusesLoaded: boolean = false
  statusSelected: number | null = null
  city: string = 'Заречный'
  region: string = 'Свердловская область'
  location?: Location[] = []
  locationId!: number
  uploadFiles: any[] = []
  pricesLock: any = []
  formData: FormData = new FormData()
  imagesPreview: string[] = []
  locationLoader: boolean = false

  minLengthCityesListError: boolean = false
  cityesList: any[] = []
  cityesListLoading: boolean = false
  searchCityes: FormControl = new FormControl('')
  maxStepsCount: number = 2
  priceArrayForm: any[] = []

  //nextButtonDisable: boolean = false

  placemark!: ymaps.Placemark
  map!: YaReadyEvent<ymaps.Map>

  createSightForm: FormGroup = new FormGroup({})

  constructor(
    private locationServices: LocationService,
    private filterService: FilterService,
    private locationSevices: LocationService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private sightsService: SightsService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private locationFromAngular: Location,
    private vkService: VkService,
    private sightTypeService: SightTypeService,
    private statusesService: StatusesService,
    private mapService: MapService,
    private sanitizer: DomSanitizer,
    private yaGeocoderService: YaGeocoderService,
    private router: Router,
  ) {}
  //Отмена создания
  openModalCancel() {
    this.cancelConfirmValue = true
  }
  cancelEdit() {
    this.cancelConfirmValue = false
  }
  async cancelConfirm() {
    this.cancelConfirmValue = false
    setTimeout(() => {
      this.router.navigate(['cabinet/sights'])
    }, 0) //убираем асинхронность
    console.log(this.cancelConfirmValue)
  }
  


  // Получаем юзера и устанавливаем группы и шаги
  getUserWithSocialAccount() {
    this.userService
      .getUser()
      .pipe(
        tap(() => {
          // this.loadingService.showLoading(MessagesLoading.vkGroupSearch)
        }),
        switchMap((user: any) => {
          this.user = user
          this.createSightForm.patchValue({ sponsor: user?.name })
          return of(user)
        }),
        switchMap((user: any) => {
          if (!user?.social_account || user?.social_account.provider != 'vkontakte') {
            this.checkSocialVk = false
            // this.toastService.showToast(
            //   MessagesErrors.vkGroupSearch,
            //   'secondary',
            // )
          } else {
            this.checkSocialVk = true
            // this.getVkGroups(user.social_account.provider_id, user.social_account.token)
            return this.vkService.getGroups().pipe(
              switchMap((response: any) => {
                response?.response.items ? this.setVkGroups(response?.response.items) : this.setVkGroups([])
                return of(EMPTY)
              }),
              catchError((err) => {
                //Выкидываем на логин если с ВК проблемы
                this.toastService.showToast(
                  err.error?.message || err.error?.error_msg || MessagesErrors.vkTokenError,
                  'danger',
                )
                this.loadingService.hideLoading()
                this.authService.logout()
                return of(EMPTY)
              }),
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
        catchError((err) => {
          this.toastService.showToast(err.error?.message || err.error?.error_msg || MessagesErrors.default, 'danger')
          this.loadingService.hideLoading()
          return of(EMPTY)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  // Устанавливаем группы
  setVkGroups(items: any) {
    if (items) {
      this.vkGroups = items
    } else {
      this.vkGroups = []
      // this.toastService.showToast(MessagesErrors.vkGroupSearch, 'secondary')
    }
  }

  edditAdress(event: any) {
    console.log(event)
    this.createSightForm.patchValue({
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      coords: [event.latitude, event.longitude],
      location_id: event.location_id,
    })
  }
  //Устанавливаем шаги
  setSteps() {
    // if(this.vkGroups){
    //   this.stepStart = 1
    //   this.stepCurrency = 1
    // } else {
    //   this.stepStart = 3
    //   this.stepCurrency = 3
    //   //this.nextButtonDisable = true
    // }
  }
  deleteVkFiles(event: any) {
    for (let i = 0; i < this.vkGroupPostSelected.attachments.length; i++) {
      if (this.vkGroupPostSelected.attachments[i].photo.id == event.name) {
        this.vkGroupPostSelected.attachments.splice(i, 1)
      }
    }
    for (let i = 0; i < this.vkFiles.length; i++) {
      if (this.vkFiles[i].name == event.name) {
        this.vkFiles.splice(i, 1)
      }
    }

    if (this.allFiles.length == 0) {
    }
  }

  //Выбираем группу
  selectedVkGroup(group_id: any) {
    if (group_id.detail.value) {
      this.vkGroupSelected = group_id.detail.value
      this.setVkPostsByGroupID(group_id.detail.value)
    } else {
      this.vkGroupSelected = null
      this.vkGroupPosts = null
    }
  }
  stepInvalidate() {
    if (this.createSightForm.value) {
      switch (this.stepCurrency) {
        case 1:
          if (this.createSightForm.value.name.length <= 3 || this.createSightForm.value.type.length == 0) {
            return true
          } else {
            return false
          }
        case 2:
          if (!this.createSightForm.value.address) {
            return true
          } else {
            return false
          }
        default:
          return false
      }
    } else {
      return true
    }
  }
  stepNext() {
    if (this.stepCurrency <= this.maxStepsCount && !this.stepInvalidate()) {
      this.stepCurrency++
    }
  }
  reset() {
    this.locationFromAngular.back()

    this.stepCurrency = 1
  }

  openModalPost(event: any = null) {
    if (this.vkGroupSelected == null) {
      this.vkGroupSelected = this.vkGroupModalSelected
      this.setVkPostsByGroupID(this.vkGroupModalSelected)
    }
    this.openModalPostValue = true
  }

  saveChangeId() {
    if (this.vkGroupSelected != null) {
      this.vkGroupModalSelected = this.vkGroupSelected
    }
  }

  closeModalPost() {
    this.openModalPostValue = false
  }

  openModalGroup() {
    this.openModalGroupValue = true
  }

  closeModalGroup() {
    this.openModalGroupValue = false
  }

  closeAllModals() {
    this.openModalPostValue = false
    this.openModalGroupValue = false
  }

  //Грузим посты по ИД группы
  setVkPostsByGroupID(group_id: number) {
    this.vkService
      .getPostsGroup(group_id, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.vkGroupPosts = response.response
        response.response ? (this.vkGroupPostsLoaded = true) : (this.vkGroupPostsLoaded = false) //для скелетной анимации
      })
  }

  // Грузим посты по URL сообщества
  async setVkPostsByGroupURL() {
    await this.vkService
      .getGroupeIdUrl(this.inputValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        let group_id: number
        group_id = response.response[0].id - response.response[0].id - response.response[0].id
        this.setVkPostsByGroupID(group_id)
      })
  }
  onFocusPlace(event: any) {
    this.inputValue = event.detail.value
  }

  getUrlVideo(owner_id: number, video_id: number) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://vk.com/video_ext.php?oid=' + owner_id + '&id=' + video_id + '&hd=2',
    )
  }

  //Выбираем пост
  selectedVkGroupPost(post: any) {
    let tempArray: any[] = []
    if (!post || this.vkGroupPostSelected?.id === post.id) {
      this.vkGroupPostSelected = null
      this.createSightForm.patchValue({ description: '' })
      this.resetUploadInfo()
    } else {
      this.vkGroupPostSelected = post
      post.attachments.forEach((file: any) => {
        if (file.type === 'photo') {
          tempArray.push({
            link: file.photo.orig_photo.url,
            name: file.photo.id,
            vk: true,
          })
        } else if (file.type === 'video') {
          if (file.video.image[0]) {
            console.log()
            tempArray.push({
              link: file.video.image[0].url,
              name: file.video.id,
              vk: true,
            })
          }
        } else {
          this.toastService.showToast('Тип вложения не поддерживается', 'warning')
        }
      })
      this.createSightForm.patchValue({
        description: this.vkGroupPostSelected.text,
      })
      this.vkFiles = tempArray
    }
  }

  //Получаем типы мероприятий
  getTypes() {
    this.loadingService.showLoading()
    this.sightTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.loadingService.hideLoading()
        this.types = response.types
        this.typesLoaded = true
      })
  }

  //Выбор типа
  selectedType(type_id: any) {
    if (/^\d+$/.test(type_id.detail.value)) {
      type_id.detail.value ? (this.typeSelected = type_id.detail.value) : (this.typeSelected = null)
    }
  }

  //Получаем статусы и устанавливаем статус по умолчанию
  getStatuses() {
    this.statusesService
      .getStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.statuses = response.statuses
        if (response.statuses) {
          response.statuses.forEach((status: IStatus) => {
            if (status.name === 'Новое') {
              this.statusSelected = status.id
              this.createSightForm.patchValue({ status: status.id })
            }
          })
          this.statusesLoaded = true //для скелетной анимации
        } else {
          this.statusesLoaded = false
        }
      })
  }

  //Выбор типа
  selectedStatus(status_id: any) {
    status_id.detail.value ? (this.statusSelected = status_id.detail.value) : (this.statusSelected = null)
  }
  getNowCityes() {
    this.cityesListLoading = true
    this.locationSevices
      .getLocationsIds(this.locationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.location = response.location
        this.city = response.location.name
        this.region = response.location.location_parent.name
        this.cityesListLoading = false
      })
  }
  getCityes(event: any) {
    if (event.target.value.length >= 3) {
      this.cityesListLoading = true
      this.minLengthCityesListError = false
      this.locationSevices
        .getLocationsName(event.target.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          this.cityesList = response.locations
          this.cityesListLoading = false
        })
    } else {
      this.minLengthCityesListError = true
    }
  }
  setCityes(item: any) {
    this.location = item
    this.city = item.name
    this.region = item.location_parent.name
    this.createSightForm.patchValue({
      coords: [item.latitude, item.longotude],
    })
    this.createSightForm.patchValue({ locationId: item.id })
    this.map.target.geoObjects.removeAll()
    this.placemark = new ymaps.Placemark([item.latitude, item.longitude])
    this.map.target.geoObjects.add(this.placemark)
    this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {
      checkZoomRange: false,
    })
    this.map.target.setZoom(17)
  }
  onClearSearch() {
    this.minLengthCityesListError = false
    this.cityesListLoading = false
    this.cityesList = []
  }

  //При клике ставим метку, если метка есть, то перемещаем ее
  async onMapClick(e: YaEvent<ymaps.Map>) {
    const { target, event } = e

    this.setLocationForCoords([event.get('coords')[0], event.get('coords')[1]])

    this.createSightForm.patchValue({
      coords: [event.get('coords')[0], event.get('coords')[1]],
    })
    // this.createEventForm.value.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    if (!Capacitor.isNativePlatform()) {
      this.ReserveGeocoder()
    } else {
      // this.createEventForm.value.address =await this.mapService.ReserveGeocoderNative(this.createEventForm.value.coords).then(res=>{console.log("res "+res)})
      this.ReserveGeocoder()
    }
    this.map.target.geoObjects.removeAll()
    this.placemark = new ymaps.Placemark(this.createSightForm.value.coords)
    this.map.target.geoObjects.add(this.placemark)
    this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {
      checkZoomRange: false,
    })
    this.map.target.setZoom(17)
  }

  // Поиск по улицам
  onMapReady(e: YaReadyEvent<ymaps.Map>) {
    this.map = e
    if (this.filterService.locationLatitude.value && this.filterService.locationLongitude.value) {
      const coords: number[] = [
        Number(this.filterService.getLocationLatitudeFromlocalStorage()),
        Number(this.filterService.getLocationLongitudeFromlocalStorage()),
      ]
      this.addPlacemark(coords)
    } else {
      this.mapService.geolocationMapNative(this.map)
    }

    const search = new ymaps.SuggestView('search-map')
    // search.setApikeys({suggest: environment.apiKeyYandexSubject})
    // search.options = []
    search.events.add('select', () => {
      if (!Capacitor.isNativePlatform()) {
        this.ForwardGeocoder()
      } else {
        // this.createEventForm.value.address=(<HTMLInputElement>document.getElementById("search-map")).value
        // let coords = this.mapService.ForwardGeocoderNative(this.createEventForm.value.address)
        // this.addPlacemark(coords!)
        this.ForwardGeocoder()
      }
    })
    // this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
  }

  //При выборе из выпадающего списка из поиска создает метку по адресу улицы
  addPlacemark(coords: number[]) {
    try {
      this.map.target.geoObjects.removeAll()
      this.placemark = new ymaps.Placemark(coords)
      this.map.target.geoObjects.add(this.placemark)
      this.createSightForm.value.coords = this.placemark.geometry?.getCoordinates()
      this.createSightForm.patchValue({
        coords: this.placemark.geometry?.getCoordinates(),
      })
      //центрирование карты по метки и установка зума
      this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {
        checkZoomRange: false,
      })
      this.map.target.setZoom(17)
    } catch (error) {}
  }

  ReserveGeocoder(): void {
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(this.createSightForm.value.coords, {
      results: 1,
    })
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0)

      //this.city=firstGeoObject.getLocalities(0)[0]
      this.createSightForm.patchValue({
        address: firstGeoObject.getAddressLine(),
      })
      //this.createSightForm.value.address = firstGeoObject.getAddressLine()
    })
  }
  setLocationForCoords(coords: number[]) {
    this.locationLoader = true
    this.locationServices
      .getLocationByCoords(coords)
      .pipe(
        delay(100),
        retry(2),
        catchError((err) => {
          this.toastService.showToast(MessagesErrors.LocationSearchError, 'warning')
          this.locationLoader = false
          return of(EMPTY)
        }),
      )
      .subscribe((response: any) => {
        this.createSightForm.patchValue({ locationId: response.location.id })
        this.city = response.location.name
        this.region = response.location.location_parent.name
        this.locationLoader = false
      })
  }

  ForwardGeocoder(): void {
    this.createSightForm.value.address = (<HTMLInputElement>document.getElementById('search-map')).value
    const geocodeResult = this.yaGeocoderService.geocode(this.createSightForm.value.address, {
      results: 1,
    })
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0)
      this.addPlacemark(firstGeoObject.geometry.getCoordinates())
      // this.createSightForm.value.patchValue({coords: firstGeoObject.geometry.getCoordinates()})
      this.createSightForm.controls['coords'].setValue(firstGeoObject.geometry.getCoordinates())
      this.setLocationForCoords(firstGeoObject.geometry.getCoordinates())
      // this.city=firstGeoObject.getLocalities(0)[0]
    })
  }

  //очистка поиска на карте
  clearSearche(sight: any) {
    if (sight.detail.value == 0) {
      this.createSightForm.patchValue({ coords: [] })
      this.placemark = new ymaps.Placemark([])
      this.map.target.geoObjects.removeAll()
    }
  }

  //Загрузка фото
  onFileChange(event: File[]) {
    this.uploadFiles = event
  }

  resetUploadInfo() {
    this.imagesPreview = [] // очищаем превьюшки
    this.uploadFiles = [] // очишщаем массив с фотками
    this.formData.delete('localFilesImg[]') // очишщаем файлы
    this.formData.delete('vkFilesVideo[]') // очишщаем файлы
    this.formData.delete('vkFilesImg[]') // очишщаем файлы
    this.formData.delete('vkFilesLink[]') // очишщаем файлы
  }

  //Удалить прею фотки
  deleteFile(img: any) {
    if (typeof img == 'string') {
      this.imagesPreview = this.imagesPreview.filter((a) => a !== img)
      this.uploadFiles = this.uploadFiles.filter((a) => a! == img)
    } else {
      for (let i = 0; i < this.vkGroupPostSelected.attachments.length; i++) {
        if (this.vkGroupPostSelected.attachments[i].photo.id == img.photo.id) {
          this.vkGroupPostSelected.attachments.splice(i, 1)
        }
      }
    }
  }

  // Заполняем превью фоток
  createImagesPreview() {
    if (this.uploadFiles && !this.createSightForm.controls['files_img'].hasError('requiredFileType')) {
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

  addPrice() {
    this.priceArrayForm.push({ price: '' })
    this.createSightForm.controls['price'].value.push(
      new FormGroup({
        cors_rub: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required, Validators.minLength(5)]),
      }),
    )
    this.pricesLock.push({ locked: false })
  }

  deletePrice(num: number) {
    this.createSightForm.controls['price'].value.splice(num, 1)
  }

  testPlug() {
    let generatePlug: GeneratePlugSightEventsImgService = new GeneratePlugSightEventsImgService(this.plug, 'create')
    generatePlug.generatePlug()
  }
  //формируем дату для отправки на сервер
  createFormData() {
    if (this.uploadFiles && !this.createSightForm.controls['files'].hasError('requiredFileType')) {
      for (var i = 0; i < this.uploadFiles.length; i++) {
        this.formData.append('localFilesImg[]', this.uploadFiles[i])
      }
    }

    if (this.vkGroupPostSelected?.attachments.length) {
      this.vkGroupPostSelected.attachments.forEach((attachment: any) => {
        if (attachment.photo) {
          let photo = attachment.photo.sizes.pop() //берем последний размер
          this.formData.append('vkFilesImg[]', photo.url)
        }
        if (attachment.video) {
          this.formData.append(
            'vkFilesVideo[]',
            'https://vk.com/video_ext.php?oid=' + attachment.video.owner_id + '&id=' + attachment.video.id + '&hd=2',
          )
        }
        if (attachment.link) {
          this.formData.append('vkFilesLink[]', attachment.link.url)
        }
      })
    }

    this.formData.append('name', this.createSightForm.controls['name'].value)
    this.formData.append('sponsor', 'Admin')
    this.formData.append('description', this.createSightForm.controls['description'].value)
    this.formData.append('workTime', this.createSightForm.controls['workTime'].value)
    this.formData.append('coords', this.createSightForm.controls['coords'].value)
    this.formData.append('address', this.createSightForm.controls['address'].value)
    this.formData.append('phone_number', this.createSightForm.controls['phone_number'].value)
    this.formData.append('email', this.createSightForm.controls['email'].value)
    this.formData.append('site', this.createSightForm.controls['site'].value)
    //this.formData.append('city', this.city)
    this.formData.append('locationId', this.createSightForm.controls['locationId'].value)
    this.formData.append('type[]', this.createSightForm.controls['type'].value)
    this.formData.append('status', this.createSightForm.controls['status'].value)
    this.createSightForm.controls['price'].value.forEach((item: any, i: number) => {
      this.formData.append(`price[${i}][cost_rub]`, item.controls.cors_rub.value),
        this.formData.append(`price[${i}][descriptions]`, item.controls.description.value)
    })
    this.formData.append('materials', this.createSightForm.controls['materials'].value)
    this.formData.append('vkPostId', this.vkGroupPostSelected?.id ? this.vkGroupPostSelected?.id : null)
    // if (this.vkGroupPostSelected?.likes.count){
    //   this.formData.append('vkLikesCount', this.vkGroupPostSelected?.likes.count)
    // }
    if (this.vkGroupSelected && this.vkGroupPostSelected?.id) {
      this.formData.append('vkGroupId', this.vkGroupSelected.toString())
    }

    return this.formData
  }

  //Клик по кнопке веперед
  nextStep() {
    this.stepCurrency++
    if (this.stepCurrency == 1) {
      setTimeout(() => {
        this.sightNameElement.setFocus()
      }, 500)
    }
    if (this.stepCurrency == 2) {
      setTimeout(() => {
        this.sightDescriptionElement.setFocus()
      }, 500)
    }
  }

  //Клик по нкопке назад
  stepPrev() {
    if (this.stepCurrency - 1 > 0) {
      this.stepCurrency--
    } else {
      this.locationFromAngular.back()
    }
  }

  //отправляем данные
  receiveType(event: Event) {
    let status = false
    this.currentType.forEach((type: any, key: number) => {
      if (event == type) {
        this.currentType.splice(key, 1)
        this.createSightForm.value.type.splice(key, 1)
        status = true
      }
    })
    if (!status) {
      this.currentType.push(Number(event))
      this.createSightForm.value.type.push(Number(event))
    }
  }

  //Клик по шагу в баре
  goToStep(step: number) {
    if (this.stepCurrency !== step) {
      this.stepCurrency = step
      //this.disabledNextButton()
      this.stepIsValid()
    }
  }

  //Блокировка шагов в баре

  stepIsValid(step: number = this.stepStart) {
    switch (step) {
      case 1:
        return this.createSightForm.controls['name'].invalid ? false : true
      case 2:
        return this.createSightForm.controls['description'].invalid ? false : true
      // case 7:
      //   return this.createSightForm.hasError('dateInvalid') ?  false :  true
      case 1:
        return this.createSightForm.controls['sponsor'].invalid ? false : true
      case 3:
        //freturn !this.createEventForm.controls['coords'].value.length ? false :  true
        return this.createSightForm.controls['coords'].invalid ? false : true
      default:
        return true
    }
  }

  //Отпрвка формы

  onSubmit() {
    this.createSightForm.value.files = this.uploadFiles
    console.log(this.createSightForm.value)
    let sight = this.createFormData() // собираем формдату
    this.createSightForm.disable()

    this.loadingService.showLoading()
    this.sightsService
      .create(sight)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.loadingService.hideLoading()
        this.toastService.showToast(MessagesSights.create, 'success')
        if (res.sight.id) {
          this.router.navigate(['/organizations/' + res.sight.id])
        } else {
          this.router.navigate(['/cabinet/organizations/'])
        }
      })
    // this.loadingService.showLoading()
    // this.sightsService
    //   .create(sight)
    //   .pipe(
    //     tap((res) => {
    //       this.loadingService.hideLoading()
    //       //this.createEventForm.reset()
    //       this.resetUploadInfo()
    //       this.vkGroupPostSelected = null
    //       this.createSightForm.controls['name'].reset()
    //       this.createSightForm.controls['description'].reset()
    //       this.createSightForm.controls['workTime'].reset()
    //       this.createSightForm.controls['address'].reset()
    //       this.createSightForm.controls['coords'].reset()
    //       if (this.createSightForm.value.files) {
    //         this.createSightForm.controls['files'].reset()
    //       }
    //       this.createSightForm.controls['price'].reset()
    //       this.createSightForm.controls['materials'].reset()
    //       this.createSightForm.controls['locationId'].reset()
    //       this.createSightForm.enable()
    //       this.stepCurrency = this.stepStart
    //       this.router.navigate(['/home'])
    //     }),
    //     catchError((err) => {
    //       console.log(err)
    //       this.toastService.showToast(err.message || MessagesErrors.default, 'danger')
    //       this.createSightForm.enable()
    //       this.loadingService.hideLoading()
    //       return of(EMPTY)
    //     }),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe((res) => {
    //     this.toastService.showToast(MessagesSights.create, 'success')
    //   })
  }

  ngOnInit() {
    let locId: any
    let coords: any
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      locId = value
    })
    this.locationServices
      .getLocationsIds(locId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        coords = [response.location.latitude, response.location.longitude]
      })
    //Создаем поля для формы
    this.createSightForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
        description: new FormControl('', [Validators.minLength(0)]),
        workTime: new FormControl('', []),
        address: new FormControl('', [Validators.required]),
        locationId: new FormControl('', [Validators.required]),
        coords: new FormControl(coords, [Validators.minLength(2)]),
        type: new FormControl([], [Validators.required]),
        status: new FormControl({ value: this.statusSelected, disabled: false }, [Validators.required]),
        files: new FormControl('', fileTypeValidator(['png', 'jpg', 'jpeg'])),
        price: new FormControl([], [Validators.required]),
        materials: new FormControl(''),
        phone_number: new FormControl(''),
        email: new FormControl(''),
        site: new FormControl(''),

      },
      [dateRangeValidator],
    )
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.locationId = value
      this.createSightForm.patchValue({ locationId: value })
    })
    this.getUserWithSocialAccount()

    this.getStatuses()
    this.getNowCityes()
    this.addPrice()
    this.loadingService.showLoading()
    this.getTypes()
    //this.getLocations()
    // this.placemark= new ymaps.Placemark(this.createSightForm.value.coords)
    // this.map.target.geoObjects.add(this.placemark)
  }

  ionViewDidWillLeave() {
    this.destroy$.next()
    this.destroy$.complete()
    this.stepCurrency = 1
    this.resetUploadInfo()
    this.createSightForm.reset()
  }

  //функция добавления цен
  // addPrice() {
  //   this.priceArrayForm.push({price: ''})
  //   this.createEventForm.controls['price'].value.push(
  //     new FormGroup({
  //       cors_rub: new FormControl('', [Validators.required]),
  //       description: new FormControl('', [Validators.required, Validators.minLength(5)]),
  //     })
  //   )
  // }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }

  // ngAfterViewInit(): {
  //   register()
  //   this.cdr.detectChanges()
  //   // this.swiperRef.changes.pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
  //   //   this.swiper = res.first.nativeElement.swiper
  //   //   console.log(res.first.nativeElement.swiper)
  //   // });

  //   // this.swiper?.update()
  //   //console.log(this.swiper)
  // }
}
