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
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import {
  switchMap,
  tap,
  of,
  Subject,
  takeUntil,
  catchError,
  delay,
  retry,
} from 'rxjs';
import {
  FormArray,
  FormControl,
  FormGroup,
  MinLengthValidator,
  Validators,
} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { EventTypeService } from 'src/app/services/event-type.service';
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
import { DomSanitizer } from '@angular/platform-browser';
import { register } from 'swiper/element/bundle';
import { FilterService } from 'src/app/services/filter.service';
import { LocationService } from 'src/app/services/location.service';
import { SightsService } from 'src/app/services/sights.service';
import { SafeUrlPipe } from './event-create.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('500ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class EventCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  count: number = 0;
  //@Input() type?: number

  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  @ViewChild("eventName") eventNameElement!: any
  @ViewChild("eventDescription") eventDescriptionElement!: any


  placesClose: any = [];

  inputValue: string = '';
  user: any;
  placeOpen: any = 0;
  stepStart: number = 0;
  stepCurrency: number = 0;
  steps: number = 5;
  dataValid: boolean = true;
  openModalImgs: boolean = false;
  openModalPostValue: boolean = false;
  openModalPostCount: number = 0;
  openModalGroupValue: boolean = false;
  vkGroups: any;
  //Создать переменную для постов со страницы
  vkGroupSelected: number | null = null;
  vkGroupModalSelected: any = 0;
  vkGroupPosts: any;
  vkGroupPostsLoaded: boolean = false;
  vkGroupPostsDisabled: boolean = false;
  vkGroupPostSelected: any = null;
  types: IEventType[] = [];
  typesLoaded: boolean = false;
  typeSelected: number | null = null;
  currentType: any = [];
  statuses: IStatus[] = [];
  statusesLoaded: boolean = false;
  statusSelected: number | null = null;
  city: string = 'Заречный';
  uploadFiles: string[] = [];
  formData: FormData = new FormData();
  imagesPreview: string[] = [];
  locationLoader: boolean = false;

  placeArrayForm: any[] = [];
  seancesArrayForm: any[] = [];
  locations: any[] = [];
  cityesListLoading = false;
  minLengthCityesListError = false;
  cityesList: any[] = [];
  sightsListLoading = false;
  sightsList: any[] = [];
  dectedDataIvalid: boolean = false;
  priceArrayForm: any[] = [];

  isNextButtonClicked: boolean = false;
  placeValid: boolean = false;
  seansValid: boolean = false;

  //nextButtonDisable: boolean = false

  placemark!: ymaps.Placemark;
  // map!:YaReadyEvent<ymaps.Map>
  maps: any[] = [];
  createEventForm: FormGroup = new FormGroup({});

  constructor(
    private sightServices: SightsService,
    private locationServices: LocationService,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private eventsService: EventsService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private vkService: VkService,
    private eventTypeService: EventTypeService,
    private statusesService: StatusesService,
    private mapService: MapService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private yaGeocoderService: YaGeocoderService
  ) {}

  nextStep() {
    this.isNextButtonClicked = true;

    // setTimeout(() => {
    //   this.isNextButtonClicked = false;
    // }, 10000);
  }

  onAdd(event: Event) {
    this.count++;
  }

  //поулчаем юзера и устанвлвиаем группы и шаги
  getUserWithSocialAccount() {
    this.userService
      .getUser()
      .pipe(
        tap(() => {
          this.loadingService.showLoading(MessagesLoading.vkGroupSearch);
        }),
        switchMap((user: any) => {
          this.user = user;
          this.createEventForm.patchValue({ sponsor: user?.name });
          return of(user);
        }),
        switchMap((user: any) => {
          if (!user?.social_account) {
            this.toastService.showToast(
              MessagesErrors.vkGroupSearch,
              'secondary'
            );
          } else {
            // this.getVkGroups(user.social_account.provider_id, user.social_account.token)
            return this.vkService.getGroups().pipe(
              switchMap((response: any) => {
                response?.response.items
                  ? this.setVkGroups(response?.response.items)
                  : this.setVkGroups([]);
                return of(EMPTY);
              }),
              catchError(err => {
                //Выкидываем на логин если с ВК проблемы
                this.toastService.showToast(
                  err.error?.message ||
                    err.error?.error_msg ||
                    MessagesErrors.vkTokenError,
                  'danger'
                );
                this.loadingService.hideLoading();
                this.authService.logout();
                return of(EMPTY);
              })
            );
          }
          return of(EMPTY);
        }),
        tap(() => {
          this.setSteps();
        }),
        tap(() => {
          this.loadingService.hideLoading();
        }),
        catchError(err => {
          this.toastService.showToast(
            err.error?.message ||
              err.error?.error_msg ||
              MessagesErrors.default,
            'danger'
          );
          this.loadingService.hideLoading();
          return of(EMPTY);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  getUrlVideo(owner_id: number, video_id: number) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://vk.com/video_ext.php?oid=' +
        owner_id +
        '&id=' +
        video_id +
        '&hd=2'
    );
  }
  //Устанавливаем группы
  setVkGroups(items: any) {
    if (items) {
      this.vkGroups = items;
    } else {
      this.vkGroups = [];
      this.toastService.showToast(MessagesErrors.vkGroupSearch, 'secondary');
    }
  }

  openModalImgsFnc() {
    this.openModalImgs = true;
  }

  closeModalImgsFnc() {
    this.openModalImgs = false;
  }

  //модальноеп окно с выбором поста
  openModalPost(event: any = null) {
    if (this.vkGroupSelected == null) {
      this.vkGroupSelected = this.vkGroupModalSelected;
      this.setVkPostsByGroupID(this.vkGroupModalSelected);
    }
    this.openModalPostValue = true;
  }

  saveChangeId() {
    if (this.vkGroupSelected != null) {
      this.vkGroupModalSelected = this.vkGroupSelected;
    }
  }

  closeModalPost() {
    this.openModalPostValue = false;
  }

  openModalGroup() {
    this.openModalGroupValue = true;
  }

  closeModalGroup() {
    this.openModalGroupValue = false;
  }

  closeAllModals() {
    this.openModalPostValue = false;
    this.openModalGroupValue = false;
  }

  //Устанавливаем шаги
  setSteps() {
    // if(this.vkGroups){
    //   this.stepStart = 1
    //   this.stepCurrency = 1
    // } else {
    //   this.stepStart = 1
    //   this.stepCurrency = 1
    //   //this.nextButtonDisable = true
    // }
  }

  //Выбираем группу
  selectedVkGroup(group_id: any) {
    if (group_id.detail.value) {
      this.vkGroupSelected = group_id.detail.value;
      this.setVkPostsByGroupID(group_id.detail.value);
    } else {
      this.vkGroupSelected = null;
      this.vkGroupPosts = null;
    }
  }

  //Грузим посты по ИД группы
  setVkPostsByGroupID(group_id: number) {
    this.vkService
      .getPostsGroup(group_id, 30)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.vkGroupPosts = response.response;

        response.response
          ? (this.vkGroupPostsLoaded = true)
          : (this.vkGroupPostsLoaded = false); //для скелетной анимации
      });
  }
  // Грузим посты по URL сообщества
  // setVkPostsByGroupURL() {
  //    this.vkService.getGroupeIdUrl(this.inputValue).pipe(takeUntil(this.destroy$)).subscribe((response) => {
  //     let group_id: number
  //     group_id = response.response[0].id - response.response[0].id - response.response[0].id
  //     this.setVkPostsByGroupID(group_id)
  //   })
  // }
  onFocusPlace(event: any) {
    this.inputValue = event.detail.value;
  }

  // getVideo(owner_id: number, video_id: number) {
  //   let vid = this.vkService.getVideo(owner_id, video_id)
  //   console.log(vid)
  //   return vid
  // }
  //Выбираем пост
  selectedVkGroupPost(post: any) {
    if (!post || this.vkGroupPostSelected?.id === post.id) {
      this.vkGroupPostSelected = null;
      this.createEventForm.patchValue({ description: '' });
      this.resetUploadInfo();
    } else {
      this.vkGroupPostSelected = post;
      this.createEventForm.patchValue({
        description: this.vkGroupPostSelected.text,
      });
    }
  }

  //Получаем типы мероприятий
  getTypes() {
    this.eventTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.types = response.types;
        this.typesLoaded = true;
      });
  }
  setLocationForCoords(coords: number[], num: number) {
    this.locationLoader = true;
    this.locationServices
      .getLocationByCoords(coords)
      .pipe(
        delay(100),
        retry(2),
        catchError(err => {
          this.toastService.showToast(
            MessagesErrors.LocationSearchError,
            'warning'
          );
          this.locationLoader = false;
          return of(EMPTY);
        })
      )
      .subscribe((response: any) => {
        this.createEventForm.value.places[num].patchValue({
          locationId: response.location.id,
        });
        this.placeArrayForm[num].city = response.location.name;
        this.placeArrayForm[num].region =
          response.location.location_parent.name;
        this.locationLoader = false;
      });
  }

  //ловим еммит и устанавливаем значение
  receiveType(event: Event) {
    let status = false;
    this.currentType.forEach((type: any, key: number) => {
      if (event == type) {
        this.currentType.splice(key, 1);
        this.createEventForm.value.type.splice(key, 1);
        status = true;
      }
    });
    if (!status) {
      this.currentType.push(Number(event));
      this.createEventForm.value.type.push(Number(event));
    }
  }

  //Выбор типа
  // selectedType(type_id: any){
  //   //костыль на проверку id или icordeon
  //   if(/^\d+$/.test(type_id.detail.value)){
  //     type_id.detail.value ? this.typeSelected = type_id.detail.value  :  this.typeSelected =  null
  //   }
  //   //Хоть и кринж лютый но работает!!!!!!!!
  // }

  //Получаем статусы и устанавливаем статус по умолчанию
  getStatuses() {
    this.statusesService
      .getStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.statuses = response.statuses;
        if (response.statuses) {
          response.statuses.forEach((status: IStatus) => {
            if (status.name === Statuses.moderation) {
              this.statusSelected = status.id;
              this.createEventForm.patchValue({ status: status.id });
            }
          });
          this.statusesLoaded = true; //для скелетной анимации
        } else {
          this.statusesLoaded = false;
        }
      });
  }

  //получаем Place
  getPlaceId(place: any) {
    let placeHtml: HTMLElement = place;
    this.placeOpen = placeHtml.id;

    this.placesClose[placeHtml.id].open = !this.placesClose[placeHtml.id].open;
  }
  //Выбор типа
  selectedStatus(status_id: any) {
    status_id.detail.value
      ? (this.statusSelected = status_id.detail.value)
      : (this.statusSelected = null);
  }
  //При клике ставим метку, если метка есть, то перемещаем ее
  onMapClick(e: YaEvent<ymaps.Map>, num: number) {
    const { target, event } = e;
    this.setLocationForCoords(
      [event.get('coords')[0], event.get('coords')[1]],
      num
    );
    // this.createEventForm.value.places[num].patchValue({address: this.mapService.ReserveGeocoderNative([event.get('coords')[0], event.get('coords')[1]])})
    this.createEventForm.value.places[num].patchValue({
      coords: [event.get('coords')[0], event.get('coords')[1]],
    });
    // this.createEventForm.value.places[num].value.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    this.maps[num].target.geoObjects.removeAll();
    this.placemark = new ymaps.Placemark(
      this.createEventForm.value.places[num].value.coords
    );
    this.maps[num].target.geoObjects.add(this.placemark);
    if (!Capacitor.isNativePlatform()) {
      this.ReserveGeocoder(num);
    } else {
      // this.createEventForm.value.places[num].patchValue({address: this.mapService.ReserveGeocoderNative(this.createEventForm.value.coords)})
      this.ReserveGeocoder(num);
    }
    this.maps[num].target.geoObjects.removeAll();
    this.maps[num].target.geoObjects.add(
      new ymaps.Placemark([event.get('coords')[0], event.get('coords')[1]])
    );
    this.maps[num].target.setBounds(
      new ymaps.Placemark([
        event.get('coords')[0],
        event.get('coords')[1],
      ]).geometry?.getBounds()!,
      { checkZoomRange: false }
    );
    this.maps[num].target.setZoom(17);
  }

  // Поиск по улицам
  onMapReady(e: YaReadyEvent<ymaps.Map>, num: number) {
    this.maps[num] = e;
    if (
      this.filterService.locationLatitude.value &&
      this.filterService.locationLongitude.value
    ) {
      const coords: number[] = [
        Number(this.filterService.getLocationLatitudeFromlocalStorage()),
        Number(this.filterService.getLocationLongitudeFromlocalStorage()),
      ];
      this.addPlacemark(coords, num);
    } else {
      this.mapService.geolocationMapNative(this.maps[num]);
    }
    const search = new ymaps.SuggestView('search-map-' + num);

    search.events.add('select', () => {
      this.ForwardGeocoder(num);
      if (!Capacitor.isNativePlatform()) {
        this.ForwardGeocoder(num);
      } else {
        // this.createEventForm.value.places[num].value.address=(<HTMLInputElement>document.getElementById("search-map"+num)).value
        // let coords = this.mapService.ForwardGeocoderNative(this.createEventForm.value.places[num].value.address)
        // this.addPlacemark(coords!)
        this.ForwardGeocoder(num);
      }
    });
  }

  //При выборе из выпадающего списка из поиска создает метку по адресу улицы
  addPlacemark(coords: number[], num: number) {
    try {
      this.maps[num].target.geoObjects.removeAll();
      this.placemark = new ymaps.Placemark(coords);
      this.maps[num].target.geoObjects.add(this.placemark);
      // this.createEventForm.value.coords=this.placemark.geometry?.getCoordinates()
      this.createEventForm.patchValue({
        coords: this.placemark.geometry?.getCoordinates(),
      });
      //центрирование карты по метки и установка зума
      this.maps[num].target.setBounds(this.placemark.geometry?.getBounds()!, {
        checkZoomRange: false,
      });
      this.maps[num].target.setZoom(17);
    } catch (error) {}
  }

  ReserveGeocoder(num: number): void {
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(
      this.createEventForm.value.places[num].value.coords,
      {
        results: 1,
      }
    );
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);

      //this.city=firstGeoObject.getLocalities(0)[0]
      this.createEventForm.controls['places'].value[num].patchValue({
        address: firstGeoObject.getAddressLine(),
      });
      //this.createEventForm.value.address = firstGeoObject.getAddressLine()
    });
  }

  ForwardGeocoder(num: number): void {
    this.createEventForm.controls['places'].value[num].patchValue({
      address: (<HTMLInputElement>document.getElementById('search-map-' + num))
        .value,
    });
    const geocodeResult = this.yaGeocoderService.geocode(
      this.createEventForm.value.places[num].value.address,
      {
        results: 1,
      }
    );
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      this.addPlacemark(firstGeoObject.geometry.getCoordinates(), num);
      this.createEventForm.controls['places'].value[num].patchValue({
        coords: firstGeoObject.geometry.getCoordinates(),
      });
      this.setLocationForCoords(firstGeoObject.geometry.getCoordinates(), num);
      //this.city=firstGeoObject.getLocalities(0)[0]
    });
  }

  //очистка поиска на карте
  clearSearche(event: any, num: number) {
    if (event.detail.value == 0) {
      this.createEventForm.patchValue({ coords: [] });
      this.placemark = new ymaps.Placemark([]);
      this.maps[num].target.geoObjects.removeAll();
    }
  }

  //Загрузка фото
  onFileChange(event: any) {
    this.resetUploadInfo();

    for (var i = 0; i < event.target.files.length; i++) {
      this.uploadFiles.push(event.target.files[i]);
    }

    this.createEventForm.patchValue({ files: '' }); // Если не обнулять будет ошибка

    this.createImagesPreview();
  }

  resetUploadInfo() {
    this.imagesPreview = []; // очищаем превьюшки
    this.uploadFiles = []; // очишщаем массив с фотками
    this.formData.delete('localFilesImg[]'); // очишщаем файлы
    this.formData.delete('vkFilesVideo[]'); // очишщаем файлы
    this.formData.delete('vkFilesImg[]'); // очишщаем файлы
    this.formData.delete('vkFilesLink[]'); // очишщаем файлы
  }

  //Удалить прею фотки
  deleteFile(img: any) {
    if (typeof img == 'string') {
      this.imagesPreview = this.imagesPreview.filter(a => a !== img);
      this.uploadFiles = this.uploadFiles.filter(a => a! == img);
    } else {
      for (let i = 0; i < this.vkGroupPostSelected.attachments.length; i++) {
        if (this.vkGroupPostSelected.attachments[i].photo.id == img.photo.id) {
          this.vkGroupPostSelected.attachments.splice(i, 1);
        }
      }
    }
  }

  // Заполняем превью фоток
  createImagesPreview() {
    if (
      this.uploadFiles &&
      !this.createEventForm.controls['files'].hasError('requiredFileType')
    ) {
      this.loadingService.showLoading();
      this.uploadFiles.forEach((file: any) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imagesPreview.push(reader.result as string);
        };
      });
      this.loadingService.hideLoading();
    }
  }

  //формируем дату для отправки на сервер
  createFormData() {
    if (
      this.uploadFiles &&
      !this.createEventForm.controls['files'].hasError('requiredFileType')
    ) {
      for (var i = 0; i < this.uploadFiles.length; i++) {
        this.formData.append('localFilesImg[]', this.uploadFiles[i]);
      }
    }

    if (this.vkGroupPostSelected?.attachments.length) {
      this.vkGroupPostSelected.attachments.forEach((attachment: any) => {
        if (attachment.photo) {
          let photo = attachment.photo.sizes.pop(); //берем последний размер
          this.formData.append('vkFilesImg[]', photo.url);
        }
        if (attachment.video) {
          this.formData.append(
            'vkFilesVideo[]',
            'https://vk.com/video_ext.php?oid=' +
              attachment.video.owner_id +
              '&id=' +
              attachment.video.id +
              '&hd=2'
          );
        }
        if (attachment.link) {
          this.formData.append('vkFilesLink[]', attachment.link.url);
        }
      });
    }

    this.formData.append('name', this.createEventForm.controls['name'].value);
    this.formData.append(
      'sponsor',
      this.createEventForm.controls['sponsor'].value
    );
    this.formData.append(
      'description',
      this.createEventForm.controls['description'].value
    );
    // this.formData.append('coords', this.createEventForm.controls['coords'].value)
    // this.formData.append('address', this.createEventForm.controls['address'].value)
    // this.formData.append('city', this.city)
    this.formData.append('type[]', this.createEventForm.controls['type'].value);
    this.formData.append(
      'status',
      this.createEventForm.controls['status'].value
    );

    this.createEventForm.controls['price'].value.forEach(
      (item: any, i: number) => {
        this.formData.append(
          `prices[${i}][cost_rub]`,
          item.controls.cors_rub.value
        );
        this.formData.append(
          `prices[${i}][descriptions]`,
          item.controls.description.value
        );
      }
    );

    this.formData.append(
      'materials',
      this.createEventForm.controls['materials'].value
    );
    this.formData.append(
      'dateStart',
      this.createEventForm.controls['dateStart'].value
    );
    this.formData.append(
      'dateEnd',
      this.createEventForm.controls['dateEnd'].value
    );
    this.formData.append(
      'places[]',
      this.createEventForm.controls['places'].value
    );

    this.createEventForm.controls['places'].value.forEach(
      (item: any, i: number) => {
        this.formData.append(
          `places[${i}][address]`,
          item.controls.address.value
        );
        this.formData.append(
          `places[${i}][coords]`,
          item.controls.coords.value
        );
        this.formData.append(
          `places[${i}][locationId]`,
          item.controls.locationId.value
        );
        this.formData.append(
          `places[${i}][sightId]`,
          item.controls.sight_id.value
        );
        item.controls.seances.value.forEach(
          (item_sean: any, i_sean: number) => {
            this.formData.append(
              `places[${i}][seances][${i_sean}][dateStart]`,
              item_sean.controls.dateStart.value
            );
            this.formData.append(
              `places[${i}][seances][${i_sean}][dateEnd]`,
              item_sean.controls.dateEnd.value
            );
          }
        );
      }
    );

    this.formData.append(
      'vkPostId',
      this.vkGroupPostSelected?.id ? this.vkGroupPostSelected?.id : null
    );
    // if (this.vkGroupPostSelected?.likes.count){
    //   this.formData.append('vkLikesCount', this.vkGroupPostSelected?.likes.count)
    // }
    if (this.vkGroupSelected && this.vkGroupPostSelected?.id) {
      this.formData.append('vkGroupId', this.vkGroupSelected.toString());
    }
    return this.formData;
  }

  //Клик по кнопке веперед
  stepNext() {
    this.stepCurrency++
    if(this.stepCurrency == 1){
      setTimeout(() => {
        this.eventNameElement.setFocus()
         },500)
     }
     if(this.stepCurrency == 2){
      setTimeout(() => {
        this.eventDescriptionElement.setFocus()
         },500)
     }
  }

  //Клик по нкопке назад
  stepPrev() {
    this.stepCurrency--;
  }

  //Клик по шагу в баре
  goToStep(step: number) {
    if (this.stepCurrency !== step) {
      this.stepCurrency = step;

      //this.disabledNextButton()
      this.stepIsValid();
    }
  }

  //Блокировка шагов в баре

  detectedDataInvalid() {
    let dataStart: any = new Date(
      this.createEventForm.controls['dateStart'].value
    );
    let dataEnd: any = new Date(
      this.createEventForm.controls['dateEnd'].value
    ).getTime();
    let dataEndPlus: any = new Date(dataStart.getTime() + 15 * 60000);

    //разница в 15 минутах

    switch (this.stepCurrency) {
      case 0:
        if (this.currentType <= 0) {
          return true;
        } else {
          return false;
        }

      //шаг первый
      case 1:
        //шаг второй
        if (
          this.createEventForm.controls['name'].invalid ||
          this.createEventForm.controls['sponsor'].invalid
        ) {
          return true;
        } else {
          return false;
        }
      case 2:
        return false;
      // //шаг третий
      // if(this.uploadFiles.length == 0 && this.createEventForm.controls['description'].invalid ||  this.createEventForm.hasError('dateInvalid')){
      //   if( dataEnd <= dataEndPlus){
      //     this.dataValid = false
      //   }else{
      //     this.dataValid = true
      //   }
      //   // console.log(dataStart)
      //   // console.log(dataEnd)

      //   return true

      // }
      // else if(this.uploadFiles.length !== 0){
      //   console.log('Можно')
      //   return false
      // }
      // else if(this.vkGroupPostSelected.attachments.length >= 1){
      //   return false
      // }
      // else{
      //   return false
      // }
      case 3:
        // let placeValid:boolean = false
        // let seansValid:boolean = false

        this.createEventForm.controls['places'].value.forEach(
          (item: any, i: number) => {
            item.controls.seances.value.forEach(
              (item_sean: any, i_sean: number) => {
                if (
                  item_sean.controls.dateStart.value >=
                  item_sean.controls.dateEnd.value
                ) {
                  this.seansValid = false;
                } else {
                  this.seansValid = true;
                }
              }
            );

            if (
              item.controls.address.value.length > 0 ||
              item.controls.address.value
            ) {
              this.placeValid = true;
            } else {
              this.placeValid = false;
            }
          }
        );

        if (this.placeValid && this.seansValid) {
          return false;
        } else {
          return true;
        }

      case 4:
        let priceValid = false;
        let validValidPrice = false;
        this.createEventForm.controls['price'].value.forEach(
          (item: any, i: number) => {
            if (this.createEventForm.controls['price'].value.length > 1) {
              priceValid = this.createEventForm.controls['price'].value.every(
                (item: any) => item.controls['description'].value.length >= 3
              );
            } else if (
              this.createEventForm.controls['price'].value.length == 1
            ) {
              priceValid = true;
            } else {
              priceValid = false;
            }
          }
        );

        if (this.createEventForm.disabled || !priceValid) {
          return true;
        } else {
          return false;
        }

      default:
        return true;
    }
  }

  getMessage(): string {
    if (!this.placeValid && !this.seansValid) {
      return 'Выберите место и время мероприятия, чтобы перейти на следующий шаг';
    } else if (!this.placeValid) {
      return 'Выберите место мероприятия, чтобы перейти на следующий шаг';
    } else if (!this.seansValid) {
      return 'Выберите время мероприятия, чтобы перейти на следующий шаг';
    } else {
      return '';
    }
  }

  stepIsValid(step: number = this.stepStart) {
    switch (step) {
      case 1:
        return this.createEventForm.controls['name'].invalid ? false : true;
      case 1:
        return this.createEventForm.controls['sponsor'].invalid ? false : true;

      case 2:
        return this.createEventForm.controls['description'].invalid
          ? false
          : true;
      case 2:
        return this.createEventForm.hasError('dateInvalid') ? false : true;

      case 4:
        //return !this.createEventForm.controls['coords'].value.length ? false :  true
        return this.createEventForm.controls['places'].invalid ? false : true;
      default:
        return true;
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

  onSubmit() {
    this.searchMinSeans();
    //собираем плейсы
    let event = this.createFormData(); // собираем формдату
    this.createEventForm.disable();
    this.loadingService.showLoading();
    this.eventsService
      .create(event)
      .pipe(
        tap(res => {
          this.loadingService.hideLoading();
          this.toastService.showToast(MessagesEvents.create, 'success');
          this.createEventForm.reset();
          this.resetUploadInfo();
          this.vkGroupPostSelected = null;
          this.createEventForm.controls['name'].reset();
          this.createEventForm.controls['description'].reset();
          // this.createEventForm.controls['address'].reset()
          // this.createEventForm.controls['coords'].reset()
          this.createEventForm.controls['files'].reset();
          this.createEventForm.controls['price'].reset();
          this.createEventForm.controls['materials'].reset();
          this.createEventForm.controls['places'].reset();
          //this.city = ''
          this.createEventForm.enable();
          this.stepCurrency = this.stepStart;
          this.router.navigate(['/home']);
        }),
        catchError(err => {
          this.toastService.showToast(
            err.error.message || MessagesErrors.default,
            'danger'
          );
          this.createEventForm.enable();
          this.loadingService.hideLoading();
          return of(EMPTY);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  addPlaceForm() {
    let locId: any;
    let coords: any;

    this.placesClose.push({ open: true });

    this.filterService.locationId
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        locId = value;
        if (value) {
          this.locationServices
            .getLocationsIds(locId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((response: any) => {
              coords = [
                response.location.latitude,
                response.location.longitude,
              ];
              this.placeArrayForm.push({
                city: response.location.name,
                region: response.location.location_parent.name,
                sight_id: '',
                sight_name: '',
                address: '',
                coords: coords,
                seances: [{ num_s: 0 }],
              });
            });
        } else {
          locId = '';
          coords = ['', ''];
          this.placeArrayForm.push({
            city: 'Не указан',
            region: 'Не указан',
            sight_id: '',
            sight_name: '',
            address: '',
            seances: [{ num_s: 0 }],
          });
        }
      });
    this.createEventForm.controls['places'].value.push(
      new FormGroup({
        sight_id: new FormControl('', [Validators.minLength(1)]),
        locationId: new FormControl(locId, [
          Validators.minLength(1),
          Validators.required,
        ]),
        coords: new FormControl(coords, [
          Validators.required,
          Validators.minLength(2),
        ]),
        address: new FormControl('', [
          Validators.minLength(1),
          Validators.required,
        ]),
        seances: new FormControl(
          [
            new FormGroup({
              dateStart: new FormControl(
                new Date().toISOString().slice(0, 19) + 'Z',
                [Validators.required]
              ),
              dateEnd: new FormControl(
                new Date().toISOString().slice(0, 19) + 'Z',
                [Validators.required]
              ),
            }),
          ],
          [Validators.required]
        ),
      })
    );
  }
  addPrice() {
    this.priceArrayForm.push({ price: '' });
    this.createEventForm.controls['price'].value.push(
      new FormGroup({
        cors_rub: new FormControl('', []),
        description: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
        ]),
      })
    );
  }
  deletePrice(num: number) {
    this.createEventForm.controls['price'].value.splice(num, 1);
  }

  deletePlaceForm(num: number) {
    this.placeArrayForm.splice(num, 1);
    this.createEventForm.controls['places'].value.splice(num, 1);
  }

  deleteSeanceForm(num: number, num_s: number) {
    this.placeArrayForm[num].seances.splice(num_s, 1);
    this.createEventForm.controls['places'].value[num].value.seances.splice(
      num_s,
      1
    );
  }

  addSeances(num: number) {
    this.placeArrayForm[num].seances.push({});
    this.createEventForm.controls['places'].value[
      num
    ].controls.seances.value.push(
      new FormGroup({
        dateStart: new FormControl(
          new Date().toISOString().slice(0, 19) + 'Z',
          [Validators.required]
        ),
        dateEnd: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [
          Validators.required,
        ]),
      })
    );
  }

  getCityes(event: any) {
    if (event.target.value.length >= 3) {
      this.cityesListLoading = true;
      this.minLengthCityesListError = false;
      this.locationServices
        .getLocationsName(event.target.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          this.cityesList = response.locations;
          this.cityesListLoading = false;
        });
    } else {
      this.minLengthCityesListError = true;
    }
  }
  onClearSearch() {
    this.minLengthCityesListError = false;
    this.cityesListLoading = false;
    this.cityesList = [];
    this.sightsListLoading = false;
    this.sightsList = [];
  }
  setCityes(item: any, num: number) {
    this.placeArrayForm[num].city = item.name;
    this.placeArrayForm[num].region = item.location_parent.name;
    this.createEventForm.value.places[num].patchValue({ locationId: item.id });
    this.maps[num].target.geoObjects.removeAll();
    // this.placemark = new ymaps.Placemark([item.latitude, item.longitude])
    this.maps[num].target.geoObjects.add(
      new ymaps.Placemark([item.latitude, item.longitude])
    );
    this.maps[num].target.setBounds(
      new ymaps.Placemark([
        item.latitude,
        item.longitude,
      ]).geometry?.getBounds()!,
      { checkZoomRange: false }
    );
    this.maps[num].target.setZoom(17);
    this.onClearSearch();
  }

  getSight(event: any, num: number) {
    if (event.target.value.length >= 3) {
      this.sightsListLoading = true;
      this.sightServices
        .getSights({
          searchText: event.target.value,
          locationId: this.createEventForm.value.places[num].value.locationId,
          limit: 100,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          this.sightsList = response.sights.data;
          this.sightsListLoading = false;
        });
    }
  }

  setSight(item: any, num: number) {
    this.placeArrayForm[num].sight_name = item.name;
    this.createEventForm.value.places[num].patchValue({
      sight_id: item.id,
      coords: [item.latitude, item.longitude],
      address: item.address,
    });
    this.addPlacemark([item.latitude, item.longitude], num);
    this.onClearSearch();
  }

  //ищем минимальный и максимальный плейс

  searchMinSeans() {
    let minSeans: any = {
      value: {
        dateStart: new Date().toISOString(),
        dateEnd: new Date().toISOString(),
      },
    };
    let maxSeans: any = {
      value: {
        dateStart: new Date().toISOString(),
        dateEnd: new Date().toISOString(),
      },
    };
    // minSeans = this.createEventForm.controls['places'].value[i].controls.seances.value[0]
    // maxSeans = this.createEventForm.controls['places'].value[i].controls.seances.value[0]
    this.createEventForm.controls['places'].value.forEach(
      (item: any, i: number) => {
        item.controls['seances'].value.forEach(
          (item_sean: any, i_sean: number) => {
            if (item_sean.value.dateStart < minSeans.value.dateStart) {
              minSeans = item_sean;
            }
            if (item_sean.value.dateEnd > maxSeans.value.dateEnd) {
              maxSeans = item_sean;
            }
          }
        );
      }
    );

    this.createEventForm.controls['dateStart'].setValue(
      minSeans.value.dateStart.slice(0, 19)
    );
    this.createEventForm.controls['dateEnd'].setValue(
      maxSeans.value.dateEnd.slice(0, 19)
    );
  }

  ngOnInit() {
    let locationId: any;
    this.filterService.locationId
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        locationId = value;
      });
    //Создаем поля для формы
    this.createEventForm = new FormGroup(
      {
        name: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
        ]),
        sponsor: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
        ]),
        description: new FormControl('', [
          Validators.required,
          Validators.minLength(10),
        ]),
        places: new FormControl([], [Validators.required]),
        type: new FormControl([], [Validators.required]),
        status: new FormControl(
          { value: this.statusSelected, disabled: false },
          [Validators.required]
        ),
        files: new FormControl('', fileTypeValidator(['png', 'jpg', 'jpeg'])),
        price: new FormControl([], [Validators.required]),
        materials: new FormControl('', [Validators.minLength(1)]),
        dateStart: new FormControl(
          new Date().toISOString().slice(0, 19) + 'Z',
          [Validators.required]
        ),
        dateEnd: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [
          Validators.required,
        ]),
      },
      [dateRangeValidator]
    );

    this.getUserWithSocialAccount();
    this.addPlaceForm();
    this.getTypes();
    this.getStatuses();
    this.addPrice();
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }
  // ngAfterViewInit() {
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
