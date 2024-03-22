import {
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  Subject,
  takeUntil,
  tap,
  retry,
  catchError,
  of,
  EMPTY,
  map,
  delay,
} from 'rxjs'
import { IonSegmentButton } from '@ionic/angular'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { SightsService } from 'src/app/services/sights.service'
import { ISight } from 'src/app/models/sight'
import { ISightType } from 'src/app/models/sight-type'
import { SightTypeService } from 'src/app/services/sight-type.service'
import { LocationService } from 'src/app/services/location.service'
import { Location } from 'src/app/models/location'
import { YaEvent, YaReadyEvent } from 'angular8-yandex-maps'
import { IPlace } from 'src/app/models/place'
import { FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'app-eddit-sight',
  templateUrl: './eddit-sight.component.html',
  styleUrls: ['./eddit-sight.component.scss'],
})
export class EdditSightComponent implements OnInit {
  constructor(
    private sightService: SightsService,
    private route: ActivatedRoute,
    private sightTypeService: SightTypeService,
    private locationSevices: LocationService,
  ) {}

  private readonly destroy$ = new Subject<void>()

  segment: number = 1
  sight_id!: number
  btnSegment: any
  @ViewChildren(IonSegmentButton) segmentButtons!: QueryList<IonSegmentButton>
  sight!: ISight
  types: ISightType[] = []
  typesLoaded: boolean = false
  typeSelected: number | null = null
  sightFiles: any
  cityesListLoading: boolean = false //проверка загружен ли лист городов
  minLengthCityesListError: boolean = false //проверка длины списка городов
  loadSight: boolean = false
  cityesList: any[] = []
  location?: Location[] = []
  locationId!: number
  city: string = 'Заречный'
  region: string = 'Свердловская область'
  loadMap: boolean = true
  sightTime: any
  edditForm!: FormGroup
  sightTypesOldID: any
  typesNow: any[] = []
  childeVariable: any
  removedTypes: string[] = [] //массив типов на удаление
  addetTypes: string[] = [] //массив типов добавленых
  addetTypesName: any[] = [] //массив для конвертации id  в имя

  @Input() place!: any

  segmentClick(event: Event) {
    let btn = event.target as HTMLButtonElement
    this.segment = Number(btn.value)
  }

  nextStage() {
    if (this.segment < 5) {
      this.segment++
    }
  }

  backStage() {
    if (this.segment > 1) {
      this.segment--
    }
  }

  getUserId() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.sight_id = params['id']
    })
  }

  getSight() {
    this.sightService
      .getSightById(this.sight_id)
      .pipe(
        retry(3),
        map((respons: any) => {
          this.sight = respons

          console.log(this.sight.name)
          this.sightFiles = this.sight.files
          this.loadSight = true

          console.log(this.sight)
          this.place = this.sight
          this.sightTypesOldID = this.place.types

          //передаём массив выбраных типов в компонент с чекбоксами
          this.typesNow = this.typesNow.concat(this.sightTypesOldID)
          console.log(this.typesNow)
        }),
        catchError((err) => {
          return of(EMPTY)
        }),
      )
      .subscribe()
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

  //получаем город
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
          console.log(response)
        })
    } else {
      this.minLengthCityesListError = true
    }
  }

  getTypes() {
    this.sightTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.types = response.types
        //response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
      })
  }
  selectedType(type_id: any) {
    type_id.detail.value
      ? (this.typeSelected = type_id.detail.value)
      : (this.typeSelected = null)
  }

  onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>) {
    //Создаем метку
    target.geoObjects.add(
      new ymaps.Placemark(
        [this.place?.latitude, this.place?.longitude],
        {},
        {
          iconLayout: 'default#imageWithContent',
          iconContentLayout: ymaps.templateLayoutFactory.createClass(
            `'<div class="marker"></div>'`,
          ),
        },
      ),
    )
    this.loadMap = false
  }

  edditSight() {
    //главная проверка данных
    if (
      this.sight.description !== this.edditForm.value.descriptionSight ||
      this.sight.name !== this.edditForm.value.nameSight
    ) {
      console.log('что то было изменено ')
      console.log(this.sight.name)
      console.log(this.edditForm.value.nameSight)
      console.log(this.edditForm.value.descriptionSight)
      console.log(this.sight.description)
    } else {
      console.log('всё как предже')
    }
  }

  showTypesNow() {}

  getType(event: any) {
    console.log('Я работаю')
    let nowTypesId: any[] = []

    for (let i = 0; i < this.typesNow.length; i++) {
      if (nowTypesId.indexOf(this.typesNow[i].id) == -1) {
        nowTypesId.push(String(this.typesNow[i].id))
      }
    }

    if (
      nowTypesId.indexOf(event) == -1 &&
      this.removedTypes.indexOf(event) == -1 &&
      this.addetTypes.indexOf(event) == -1
    ) {
      this.addetTypes.push(event)
      let type = this.types.find((t) => t.id == event)

      this.addetTypesName.push(type?.name)

      console.log('типы', this.types)
    }
    //добавляю в массив апдейта
    else if (
      this.removedTypes.indexOf(event) !== -1 &&
      this.addetTypes.indexOf(event) == -1 &&
      nowTypesId.indexOf(event) == -1
    ) {
      this.removedTypes.splice(this.removedTypes.indexOf(event), 1)
      this.addetTypes.push(event)

      console.log('Добавленых типов', this.addetTypes)
    }

    // удаляю из массива апдейтов
    else if (
      this.addetTypes.indexOf(event) !== -1 &&
      nowTypesId.indexOf(event) == -1
    ) {
      this.addetTypes.splice(this.addetTypes.indexOf(event), 1)
      console.log('Добавленых типов', this.addetTypes)
    }
    // добавляю в массив удалённых добавленные ранее
    else if (nowTypesId.indexOf(event) !== -1) {
      this.removedTypes.push(event)
      console.log('Удаление добавленых ранее типов', this.removedTypes)
    }

    console.log(nowTypesId)
    console.log(this.addetTypesName)
    console.log(this.addetTypesName)
  }

  ngOnInit() {
    this.getTypes()
    this.getUserId()
    this.getSight()
    this.edditForm = new FormGroup({
      nameSight: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      prices: new FormControl([], Validators.required),
      types: new FormControl([], Validators.required),
      descriptionSight: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    })
  }
}
