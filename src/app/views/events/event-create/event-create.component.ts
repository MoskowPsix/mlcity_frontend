import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  NgModule,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  inject,
} from '@angular/core'
import { trigger, style, animate, transition } from '@angular/animations'
import { switchMap, tap, of, Subject, takeUntil, catchError, delay, retry } from 'rxjs'
import { FormArray, FormControl, FormGroup, MinLengthValidator, Validators } from '@angular/forms'
import { UserService } from 'src/app/services/user.service'
import { MaskitoOptions } from '@maskito/core'
import { EventTypeService } from 'src/app/services/event-type.service'
import { IEventType } from 'src/app/models/event-type'
import { Location } from '@angular/common'
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
import { EventsService } from 'src/app/services/events.service'
import { MessagesEvents } from 'src/app/enums/messages-events'
import { Capacitor } from '@capacitor/core'
import { AuthService } from 'src/app/services/auth.service'
import { EMPTY } from 'rxjs/internal/observable/empty'
import { StatusesService } from 'src/app/services/statuses.service'
import { VkService } from 'src/app/services/vk.service'
import { DomSanitizer } from '@angular/platform-browser'
import { register } from 'swiper/element/bundle'
import { FilterService } from 'src/app/services/filter.service'
import { LocationService } from 'src/app/services/location.service'
import { SightsService } from 'src/app/services/sights.service'
import { SafeUrlPipe } from './event-create.pipe'
import { Router } from '@angular/router'
import { OrganizationService } from 'src/app/services/organization.service'
import { CreateRulesModalComponent } from 'src/app/components/create-rules-modal/create-rules-modal.component'
import { maskitoTimeOptionsGenerator } from '@maskito/kit'
import { IOrganization } from 'src/app/models/organization'
import { Console } from 'console'
import { TextFormatService } from 'src/app/services/text-format.service'
import moment from 'moment'

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('500ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('500ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class EventCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  count: number = 0

  mobile: boolean = false
  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT
  currentTime = new Date()
  organizations: IOrganization[] = []
  vkFiles: any[] = []
  allFiles: any[] = []
  @ViewChild('eventName') eventNameElement!: any
  @ViewChild('eventDescription') eventDescriptionElement!: any
  @HostListener('window:resize', ['$event'])
  mobileOrNote() {
    if (window.innerWidth < 900) {
      this.mobile = true
    } else if (window.innerWidth > 900) {
      this.mobile = false
    } else {
      this.mobile = false
    }
  }
  placesClose: any = []
  maskTime: MaskitoOptions = maskitoTimeOptionsGenerator({
    mode: 'HH:MM',
  })
  inputValue: string = ''
  user: any
  createFormCount: number = 0
  placeOpen: any = 0
  stepStart: number = 0
  stepCurrency: number = 1
  createObj: any = {}
  dataValid: boolean = true
  openModalImgs: boolean = false
  openModalPostValue: boolean = false
  openModalPostCount: number = 0
  openModalGroupValue: boolean = false
  vkGroups: any
  //Создать переменную для постов со страницы
  vkGroupSelected: number | null = null
  vkGroupModalSelected: any = 0
  checkSocialVk: boolean = false
  vkGroupPosts: any
  vkGroupPostsLoaded: boolean = false
  vkGroupPostsDisabled: boolean = false
  vkGroupPostSelected: any = null
  types: IEventType[] = []
  typesLoaded: boolean = false
  typeSelected: number | null = null
  currentType: any = []
  dateTomorrow = new Date()

  statuses: IStatus[] = []
  statusesLoaded: boolean = false
  statusSelected: number | null = null
  city: string = 'Заречный'
  uploadFiles: any[] = []
  formData: FormData = new FormData()
  imagesPreview: string[] = []
  locationLoader: boolean = false
  userHasOrganization: boolean = false
  placeArrayForm: any[] = []
  seancesArrayForm: any[] = []
  locations: any[] = []
  selectedOrganizationMore:any
  cityesListLoading = false
  minLengthCityesListError = false
  cityesList: any[] = []
  sightsListLoading = false
  sightsList: any[] = []
  dectedDataIvalid: boolean = false
  priceArrayForm: any[] = []
  cancelConfirmValue: boolean = false
  textFormat:TextFormatService = inject(TextFormatService)
  entranceFree: boolean = true
  maxStepsCount: number = 4
  isNextButtonClicked: boolean = false
  placeValid: boolean = false
  seansValid: boolean = false
  startTime: any = '12, 0, 0, 0'
  startEnd: any = ''
  DateTimeFormatOptions: any = new Intl.DateTimeFormat('ru', {
    dateStyle: 'short',
  })
  selectedOrganization!: IOrganization
  formatingTimeStart: string = ''
  formatingTimeEnd: string = ''

  modalSelectedOrganization!: boolean

  placemark!: ymaps.Placemark

  maps: any[] = []
  createEventForm: FormGroup = new FormGroup({})

  constructor(
    private sightServices: SightsService,
    private locationServices: LocationService,
    private filterService: FilterService,
    private authService: AuthService,
    private eventsService: EventsService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private vkService: VkService,
    private eventTypeService: EventTypeService,
    private statusesService: StatusesService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private organizationService: OrganizationService,
    private location: Location,
  ) {}

  //Клик по кнопке веперед
  stepNext() {
    if (this.stepCurrency <= this.maxStepsCount && !this.stepInvalidate()) {
      this.stepCurrency++
    }
    if(this.stepCurrency == 3 && this.createEventForm.value.places.length == 0){
      this.addPlace()
    }
  }

  //Клик по нкопке назад
  stepPrev() {
    if (this.stepCurrency - 1 > 0) {
      this.stepCurrency--
    } else {
      this.location.back()
    }
  }

  onAdd(event: Event) {
    this.count++
  }
  // logForm() {
  //   console.log(this.createEventForm.value)
  // }

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
  selectOrganization(event: any) {
    this.selectedOrganizationMore = event
    this.selectedOrganization = event.organization
    let id = this.selectedOrganization.id
    if (event.vk_group_id) {
      this.vkGroupSelected = event.vk_group_id
      this.setVkPostsByGroupID(event.vk_group_id)
      this.openModalPostValue = true
      this.checkSocialVk = false
    }
    this.createEventForm.patchValue({ organization_id: id })
    this.modalSelectedOrganization = !this.modalSelectedOrganization
  }
  //поулчаем юзера и устанвлвиаем группы и шаги
  getUserWithSocialAccount() {
    this.userService
      .getUser()
      .pipe(
        tap(() => {
          // this.loadingService.showLoading(MessagesLoading.vkGroupSearch)
        }),
        switchMap((user: any) => {
          this.user = user
          return of(user)
        }),
        switchMap((user: any) => {
          if (!user?.social_account || user?.social_account.provider != 'vkontakte') {
            this.checkSocialVk = false
          } else {
            return this.vkService.getGroups().pipe(
              switchMap((response: any) => {
                this.checkSocialVk = true
                response?.response.items ? this.setVkGroups(response?.response.items) : this.setVkGroups([])
                return of(EMPTY)
              }),
              catchError((err) => {
                //Выкидываем на логин если с ВК проблемы
                this.toastService.showToast(
                  err.error?.message || err.error?.error_msg || MessagesErrors.vkTokenError,
                  'danger',
                )

                this.authService.logout()
                return of(EMPTY)
              }),
            )
          }
          return of(EMPTY)
        }),
        tap(() => {}),
        tap(() => {}),
        catchError((err) => {
          this.toastService.showToast(err.error?.message || err.error?.error_msg || MessagesErrors.default, 'danger')

          return of(EMPTY)
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  getUrlVideo(owner_id: number, video_id: number) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://vk.com/video_ext.php?oid=' + owner_id + '&id=' + video_id + '&hd=2',
    )
  }
  //Устанавливаем группы
  setVkGroups(items: any) {
    if (items) {
      this.vkGroups = items
    } else {
      this.vkGroups = []
      // this.toastService.showToast(MessagesErrors.vkGroupSearch, 'secondary')
    }
  }

  openModalImgsFnc() {
    this.openModalImgs = true
  }
  reset() {
    this.location.back()
    this.createEventForm.reset()
    this.stepCurrency = 1
  }
  closeModalImgsFnc() {
    this.openModalImgs = false
  }

  //модальноеп окно с выбором поста
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

  //Грузим посты по ИД группы
  setVkPostsByGroupID(group_id: number) {
    this.vkService
      .getPostsGroup(group_id, 30)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.vkGroupPosts = response.response
        response.response ? (this.vkGroupPostsLoaded = true) : (this.vkGroupPostsLoaded = false) //для скелетной анимации
      })
  }

  onFocusPlace(event: any) {
    this.inputValue = event.detail.value
  }
  //Выбираем пост
  selectedVkGroupPost(post: any) {
    let tempArray: any[] = []
    if (!post || this.vkGroupPostSelected?.id === post.id) {
      this.vkGroupPostSelected = null
      this.createEventForm.patchValue({ description: '' })
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
      this.createEventForm.patchValue({
        description: this.vkGroupPostSelected.text,
      })
      this.vkFiles = tempArray
    }
  }

  //Получаем типы мероприятий
  getTypes() {
    this.loadingService.showLoading()
    this.eventTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.types = response.types
        this.loadingService.hideLoading()
        this.typesLoaded = true
      })
  }

  stepInvalidate() {
    if (this.createEventForm.value) {
      switch (this.stepCurrency) {
        case 1:
          if (
            this.createEventForm.value.name.length <= 3 ||
            !this.createEventForm.value.type.length ||
            (this.userHasOrganization && !this.createEventForm.value.organization_id)
          ) {
            return true
          } else {
            return false
          }
        case 2:
          return false
        case 3:
          let allPlacesValid = true
          if (this.createEventForm.value.places.length == 0) {
            allPlacesValid = false
          }
          this.createEventForm.value.places.forEach((place: any) => {
            if (place.seances.length == 0 || place.address.length == 0) {
              allPlacesValid = false
            }
            place.seances.forEach((seance: any) => {
              if (!seance.date_start) {
                allPlacesValid = false
              }
            })
          })
          return !allPlacesValid
        case 4:
          return false
        default:
          return false
      }
    } else {
      return true
    }
  }
  //ловим еммит и устанавливаем значение
  receiveType(event: Event) {
    let status = false
    this.currentType.forEach((type: any, key: number) => {
      if (event == type) {
        this.currentType.splice(key, 1)
        this.createEventForm.value.type.splice(key, 1)
        status = true
      }
    })
    if (!status) {
      this.currentType.push(Number(event))
      this.createEventForm.value.type.push(Number(event))
    }
  }
  setValuePrice(event: any) {
    let id = event.temp_id
    let index = this.createEventForm.value.price.map((e: any) => e.temp_id).indexOf(event.temp_id)
    this.createEventForm.value.price[index].cost_rub = event.cost_rub
    this.createEventForm.value.price[index].descriptions = event.descriptions
    this.createEventForm.value.price
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
            if (status.name == 'Новое') {
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
  selectedStatus(status_id: any) {
    status_id.detail.value ? (this.statusSelected = status_id.detail.value) : (this.statusSelected = null)
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
    if (this.uploadFiles && !this.createEventForm.controls['files'].hasError('requiredFileType')) {
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
  createFormData() {
    if (this.uploadFiles && !this.createEventForm.controls['files'].hasError('requiredFileType')) {
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

    this.formData.append('name', this.createEventForm.controls['name'].value)
    this.createEventForm.value.description.length > 0
      ? this.formData.append('description', this.createEventForm.controls['description'].value)
      : null
    this.formData.append('organization_id', this.createEventForm.controls['organization_id'].value)

    this.formData.append('type', this.createEventForm.controls['type'].value)
    this.formData.append('status', this.createEventForm.controls['status'].value)
    this.formData.append('age_limit', this.createEventForm.controls['ageLimit'].value)
    this.formData.append('sponsor', 'Admin')

    this.createEventForm.controls['price'].value.forEach((item: any, i: number) => {
      this.formData.append(`prices[${i}][cost_rub]`, item.cost_rub)
      this.formData.append(`prices[${i}][descriptions]`, item.descriptions)
    })

    this.formData.append('materials', this.createEventForm.controls['materials'].value)
    this.formData.append('dateStart', this.createEventForm.value.dateStart)
    this.formData.append('dateEnd', this.createEventForm.value.dateStart)
    this.formData.append('places[]', this.createEventForm.controls['places'].value)
    this.createEventForm.controls['places'].value.forEach((item: any, i: number) => {
      this.formData.append(`places[${i}][address]`, item.address)
      this.formData.append(`places[${i}][sightId]`, '')
      this.formData.append(`places[${i}][coords]`, item.coords)
      this.formData.append(`places[${i}][locationId]`, item.location_id)
      item.seances.forEach((item_sean: any, i_sean: number) => {
        this.formData.append(`places[${i}][seances][${i_sean}][dateStart]`, item_sean.date_start)
        this.formData.append(`places[${i}][seances][${i_sean}][dateEnd]`, item_sean.date_start)
      })
    })
    console.log(this.vkGroupPostSelected?.id)
    this.formData.append('vkPostId', this.vkGroupPostSelected?.id ? this.vkGroupPostSelected?.id : '')
    if (this.vkGroupSelected && this.vkGroupPostSelected?.id) {
      this.formData.append('vkGroupId', this.vkGroupSelected.toString())
    }
    return this.formData
  }
  setAgeLimit(event: any) {
    this.createEventForm.controls['ageLimit'].setValue(event.target.value)
  }
  detectedDataInvalid() {
    let dataStart: any = new Date(this.createEventForm.controls['dateStart'].value)
    let dataEnd: any = new Date(this.createEventForm.controls['dateEnd'].value).getTime()
    let dataEndPlus: any = new Date(dataStart.getTime() + 15 * 60000)

    //разница в 15 минутах

    switch (this.stepCurrency) {
      case 0:
        if (this.currentType <= 0) {
          return true
        } else {
          return false
        }

      //шаг первый
      case 1:
        //шаг второй
        if (
          this.createEventForm.controls['name'].invalid ||
          (this.userHasOrganization && !this.createEventForm.value.organization_id)
        ) {
          return true
        } else {
          return false
        }
      case 2:
        return false

      case 3:
        this.createEventForm.controls['places'].value.forEach((item: any, i: number) => {
          item.controls.seances.value.forEach((item_sean: any, i_sean: number) => {
            if (item_sean.controls.dateStart.value >= item_sean.controls.dateEnd.value) {
              this.seansValid = false
            } else {
              this.seansValid = true
            }
          })

          if (item.controls.address.value.length > 0 || item.controls.address.value) {
            this.placeValid = true
          } else {
            this.placeValid = false
          }
        })

        if (this.placeValid && this.seansValid) {
          return false
        } else {
          return true
        }

      case 4:
        let tempPrice
        this.createFormCount = 0
        let priceValid = false
        let validValidPrice = false
        if (this.createEventForm.controls['price'].value.length == 0) {
          priceValid = true
        }
        this.createEventForm.controls['price'].value.forEach((item: any, i: number) => {
          if (this.createEventForm.controls['price'].value.length > 1) {
            priceValid = this.createEventForm.controls['price'].value.every(
              (item: any) => item.controls['description'].value.length >= 3,
            )
          } else if (this.createEventForm.controls['price'].value.length == 1) {
            priceValid = true
          } else {
            priceValid = false
          }
        })

        if (this.createEventForm.disabled || !priceValid) {
          return true
        } else {
          return false
        }
      case 5:
        if (this.createFormCount == 0) {
          this.createFormCount++
          this.searchMinSeans()
          this.createObj = {
            name: this.createEventForm.value.name,
            date_start:
              this.createEventForm.value.dateStart.split('T')[0] +
              ' ' +
              this.createEventForm.value.dateStart.split('T')[1].split('+')[0],
            date_end:
              this.createEventForm.value.dateEnd.split('T')[0] +
              ' ' +
              this.createEventForm.value.dateEnd.split('T')[1].split('+')[0],

            price: this.createEventForm.value.price,
            places: this.createEventForm.value.places,
            files: this.imagesPreview,
            vkFiles: this.vkGroupPostSelected?.attachments,
          }
        }

        return false
      default:
        return true
    }
  }

  public nullPrice(): void {
    if (this.createEventForm.controls['price'].value.length == 0) {
      this.addPrice()
    }
  }

  stepIsValid(step: number = this.stepStart) {
    switch (step) {
      case 1:
        return this.createEventForm.controls['name'].invalid ? false : true
      case 1:
        return this.createEventForm.controls['sponsor'].invalid ? false : true

      case 2:
        return this.createEventForm.controls['description'].invalid ? false : true
      case 2:
        return this.createEventForm.hasError('dateInvalid') ? false : true

      case 4:
        //return !this.createEventForm.controls['coords'].value.length ? false :  true
        return this.createEventForm.controls['places'].invalid ? false : true
      default:
        return true
    }
  }

  formatingText(){
    //Форматируем текст пользователя
    let newDescription = this.textFormat.formatingText(this.createEventForm.value.description)
    this.createEventForm.value.description = newDescription
  }

  //Отпрвка формы

  onSubmit() {
    this.searchMinSeans()
    this.formatingText()
    this.createEventForm.value.files = this.uploadFiles
    this.nullPrice()

    //собираем плейсы
    let event = this.createFormData() // собираем формдату
    this.loadingService.showLoading()
    this.eventsService
      .create(event)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.loadingService.hideLoading()
        this.toastService.showToast(MessagesEvents.create, 'success')
        if (res.event.id) {
          this.router.navigate(['/cabinet/events/'])
        } else {
          this.router.navigate(['/cabinet/events/'])
        }
      })
    //отправляем форму
    // this.createEventForm.disable()
    // this.loadingService.showLoading()
    // this.eventsService
    //   .create(event)
    //   .pipe(
    //     tap((res) => {
    //       this.loadingService.hideLoading()
    //       this.toastService.showToast(MessagesEvents.create, 'success')
    //       this.createEventForm.reset()
    //       this.resetUploadInfo()
    //       this.vkGroupPostSelected = null
    //       this.createEventForm.controls['name'].reset()
    //       this.createEventForm.controls['description'].reset()
    //       this.createEventForm.controls['files'].reset()
    //       this.createEventForm.controls['price'].reset()
    //       this.createEventForm.controls['materials'].reset()
    //       this.createEventForm.controls['places'].reset()
    //       this.createEventForm.enable()
    //       this.stepCurrency = this.stepStart

    //       this.router.navigate(['/home'])
    //     }),
    //     catchError((err) => {
    //       console.log(err)
    //       this.toastService.showToast(err.error.message || MessagesErrors.default, 'danger')
    //       this.createEventForm.enable()
    //       this.loadingService.hideLoading()
    //       return of(EMPTY)
    //     }),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe()
  }

  addPlace() {
    console.log(this.selectedOrganizationMore)
    let tempPlace:any
    if(!this.selectedOrganizationMore || !this.selectedOrganizationMore.address){
      tempPlace = {
        temp_id: this.createEventForm.value.places.length,
        latitude: '',
        longitude: '',
        address: '',
        seances: [],
      }
    }else{
      tempPlace = {
        temp_id: this.createEventForm.value.places.length,
        latitude: this.selectedOrganizationMore.latitude,
        longitude: this.selectedOrganizationMore.longitude,
        address: this.selectedOrganizationMore.address,
        seances: [],
      }
    }
   
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      let locId = value
      if (value) {
        this.locationServices
          .getLocationsIds(locId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((responce: any) => {
            tempPlace.latitude = responce.location.latitude
            tempPlace.longitude = responce.location.longitude
          })
      }
    })

    this.createEventForm.value.places.push(tempPlace)
  }
  deletePlace(placeId: any) {
    this.createEventForm.value.places.splice(placeId, 1)
  }
  addPrice() {
    this.entranceFree = false
    this.createEventForm.value.price.push({
      temp_id: this.createEventForm.value.price.length,
      cost_rub: '',
      descriptions: '',
    })
  }
  deletePrice(num: number) {
    if (this.createEventForm.controls['price'].value.length > 1) {
      this.createEventForm.controls['price'].value.splice(num, 1)
    } else {
      this.entranceFree = true
      this.createEventForm.controls['price'].value.splice(num, 1)
      this.entranceFree = true
    }
  }

  deletePlaceForm(num: number) {
    this.placeArrayForm.splice(num, 1)
    this.createEventForm.controls['places'].value.splice(num, 1)
  }

  addSeances(event: number) {
    let tomorrow = moment().add(1,'days')
    // this.placeArrayForm[num].seances.push({})
    // this.createEventForm.controls['places'].value[num].controls.seances.value.push(
    //   new FormGroup({
    //     temp_id: new FormControl(1, [Validators.required]),
    //     dateStart: new FormControl('', [Validators.required]),
    //   }),
    // )
    if (this.createEventForm.value.places[event].seances) {
      this.createEventForm.value.places[event].seances.push({
        temp_id: this.createEventForm.value.places[event].seances.length,
        date_start: tomorrow.format('YYYY-MM-DDTHH:MM'),
        date_end: tomorrow.format('YYYY-MM-DDTHH:MM'),
      })
    }
  }
  deleteSeances(seance: any) {
    let seanceIndex = this.createEventForm.value.places[seance.placeId].seances
      .map((e: any) => e.temp_id)
      .indexOf(seance.temp_id)
    this.createEventForm.value.places[seance.placeId].seances.splice(seanceIndex, 1)
  }
  editSeances(seance: any) {
    let seanceIndex = this.createEventForm.value.places[seance.placeId].seances
      .map((e: any) => e.temp_id)
      .indexOf(seance.temp_id)
    this.createEventForm.value.places[seance.placeId].seances[seanceIndex].date_start = seance.date_start
  }
  editAddress(event: any) {
    let index = event.placeId
    this.createEventForm.value.places[index].location_id = event.location_id
    this.createEventForm.value.places[index].address = event.address
    this.createEventForm.value.places[index].coords = [event.latitude, event.longitude]
    this.createEventForm.value.places[index].latitude = event.latitude
    this.createEventForm.value.places[index].longitude = event.longitude
  }

  getCityes(event: any) {
    if (event.target.value.length >= 3) {
      this.cityesListLoading = true
      this.minLengthCityesListError = false
      this.locationServices
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

  checkHasUserOrganizations() {
    this.organizationService
      .checkHasUserOrganization()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.userHasOrganization = response.status
      })
  }

  onClearSearch() {
    this.minLengthCityesListError = false
    this.cityesListLoading = false
    this.cityesList = []
    this.sightsListLoading = false
    this.sightsList = []
  }

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
      this.router.navigate(['cabinet/events'])
    }, 0) //убираем асинхронность
  }


  //ищем минимальный и максимальный плейс

  searchMinSeans() {
    let minSeance = this.createEventForm.value.places[0].seances[0].date_start
    this.createEventForm.value.places.forEach((place: any) => {
      place.seances.forEach((seance: any) => {
        if (seance.date_start < minSeance) {
          minSeance = seance.date_start
        }
      })
    })
    this.createEventForm.value.dateStart = minSeance

    this.createEventForm.value.dateEnd = minSeance
  }

  ionViewDidWillLeave() {
    this.destroy$.next()
    this.destroy$.complete()
    this.stepCurrency = 1
    this.resetUploadInfo()
    this.createEventForm.reset()
  }
  ionViewWillEnter() {}
  ngOnInit() {
    this.organizationService
      .getUserOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.organizations = res.organizations.data
      })
    this.checkHasUserOrganizations()
    this.mobileOrNote()
    let locationId: any
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      locationId = value
    })
    //Создаем поля для формы
    this.createEventForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        organization_id: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required, Validators.minLength(10)]),
        places: new FormControl([], [Validators.required]),
        type: new FormControl([], [Validators.required]),
        ageLimit: new FormControl(18, [Validators.required]),
        status: new FormControl({ value: this.statusSelected, disabled: false }, [Validators.required]),
        files: new FormControl('', fileTypeValidator(['png', 'jpg', 'jpeg'])),
        price: new FormControl([], [Validators.required]),
        materials: new FormControl('', [Validators.minLength(1)]),
        dateStart: new FormControl('', [Validators.required]),
        dateEnd: new FormControl('', [Validators.required]),
      },
      [dateRangeValidator],
    )

    this.getUserWithSocialAccount()
    this.getTypes()
    this.getStatuses()
  }
  clearFormOfTempData() {
    // let tempForm = _.cloneDeep(this.editForm)
    if (this.createEventForm.value.price) {
      this.createEventForm.value.price.forEach((price: any) => {
        if (price.temp_id) {
          delete price.temp_id
        }
      })
    }
    if (this.createEventForm.value.types) {
      this.createEventForm.value.types.forEach((type: any) => {
        if (type.temp_id) {
          delete type.temp_id
        }
      })
    }

    if (this.createEventForm.value.places) {
      this.createEventForm.value.places.forEach((place: any) => {
        if (place.temp_id) {
          delete place.temp_id
        }
        place.seances.forEach((seance: any) => {
          if (seance.temp_id) {
            delete seance.temp_id
          }
        })
      })
    }
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
