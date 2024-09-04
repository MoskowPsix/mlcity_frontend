import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { catchError, EMPTY, of, Subject, takeUntil, tap } from 'rxjs'
import { IEvent } from 'src/app/models/event'
import { EventsService } from 'src/app/services/events.service'
import { LoadingService } from 'src/app/services/loading.service'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
import { EventTypeService } from 'src/app/services/event-type.service'
import { IEventType } from 'src/app/models/event-type'
import { environment } from 'src/environments/environment'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { IPlace } from 'src/app/models/place'
import { EventHistoryContent } from 'src/app/clasess/history_content/event_history_content'
import { EditService } from 'src/app/services/edit.service'
import { ToastService } from 'src/app/services/toast.service'
import _ from 'lodash'
import { serialize } from 'object-to-formdata'
interface InvalidForm {
  name: boolean
  sponsor: boolean
  description: boolean
  types: boolean
  places: boolean

  seances: {
    error: boolean
    message: string[]
  }
  price: boolean
  addressPlace: boolean
}
@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit {
  constructor(
    private eventTypeService: EventTypeService,
    private routeActivated: ActivatedRoute,
    private toastService: ToastService,
    private eventsService: EventsService,
    private loadingService: LoadingService,
    private editService: EditService,
    private router: Router,
  ) {}
  private readonly destroy$ = new Subject<void>()
  event!: IEvent
  editForm!: FormGroup
  finalObject!: IEvent
  openModalCategory: boolean = false
  placesArray: IPlace[] = []
  allTypes: IEventType[] = []
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  previewCategory: any = []
  submitButtonState: boolean = false
  copyEvent: any
  freeEntry: boolean = true
  formData: FormData = new FormData()
  options: object = {
    indexes: true,
    indices: true,
    nullsAsUndefineds: false,
    booleansAsIntegers: false,
    allowEmptyArrays: false,
    noAttributesWithArrayNotation: false,
    noFilesWithArrayNotation: false,
    dotsForObjectNotation: false,
  }

  invalidForm: InvalidForm = {
    name: false,
    description: false,
    sponsor: false,
    types: false,
    places: false,
    seances: {
      error: false,
      message: [''],
    },
    price: false,
    addressPlace: false,
  }
  checkfreeEntry() {
    //проверка количества билетов
    if (this.editForm.value.price.map((e: any) => e.on_delete).indexOf(undefined) == -1) {
      return true
    } else {
      return false
    }
  }
  checkCountPlaces() {
    if (this.editForm.value.places.map((e: any) => e.on_delete).indexOf(undefined) == -1) {
      return true
    } else {
      return false
    }
  }
  logFiles(event: any) {
    this.editForm.value.files = event
  }
  addPrice() {
    this.editForm.value.price.push({
      temp_id: this.editForm.value.price.length,
      cost_rub: '',
      descriptions: '',
    })
  }
  deletePrice(event: any) {
    if (event.id) {
      let index = this.editForm.value.price.map((e: any) => e.id).indexOf(event.id)
      let price = this.editForm.value.price[index]
      this.editForm.value.price[index] = {
        id: price.id,
        event_id: price.event_id,
        sight_id: price.sight_id,
        cost_rub: price.cost_rub,
        description: price.descriptions,
        on_delete: true,
      }
    } else {
      let index = this.editForm.value.price.indexOf(event)
      this.editForm.value.price.splice(index, 1)
    }
  }
  editAddress(event: any) {
    let index = event.placeId
    this.editForm.value.places[index].location_id = event.location_id
    this.editForm.value.places[index].address = event.address
    this.editForm.value.places[index].latitude = event.latitude
    this.editForm.value.places[index].longitude = event.longitude
  }
  getPriceIndex(event: any) {
    if (event.id) {
      let index = this.editForm.value.price.map((e: any) => e.id).indexOf(event.id)
      return index
    } else {
      if (event.temp_id) {
        let index = this.editForm.value.price.indexOf(event)
        return index
      }
    }
  }
  setValuePrice(event: any) {
    if (event.id) {
      let index = this.getPriceIndex(event)
      this.editForm.value.price[index].cost_rub = event.cost_rub
      this.editForm.value.price[index].descriptions = event.descriptions
    } else {
      let id = event.temp_id

      let index = this.editForm.value.price.map((e: any) => e.temp_id).indexOf(event.temp_id)
      this.editForm.value.price[index].cost_rub = event.cost_rub
      this.editForm.value.price[index].descriptions = event.descriptions
      this.editForm.value.price
    }
  }
  getCategory() {
    if (this.allTypes.length == 0) {
      this.loadingService.showLoading()
      this.eventTypeService
        .getTypes()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.allTypes = res.types
          this.loadingService.hideLoading()
          if (res.status === 'success') {
            this.openModalCategory = true
          }
        })
    } else {
      this.openModalCategory = true
    }
  }
  closeModal() {
    this.openModalCategory = false
  }
  checkCategory(category: IEventType) {
    let index = this.editForm.value.types.map((e: any) => e.id).indexOf(category.id)
    if (index !== -1 && !this.editForm.value.types[index].on_delete) {
      return true
    } else {
      return false
    }
  }
  clickCategory(category: IEventType) {
    let index = this.editForm.value.types.map((e: any) => e.id).indexOf(category.id)
    let previewTempIndex = this.previewCategory.map((e: any) => e.id).indexOf(category.id)
    if (index == -1) {
      this.editForm.value.types.push({
        id: category.id,
      })
      this.previewCategory.push(category)
    } else {
      if (this.editForm.value.types[index].name && !this.editForm.value.types[index].on_delete) {
        this.editForm.value.types[index].on_delete = true
        this.previewCategory.splice(previewTempIndex, 1)
      } else if (this.editForm.value.types[index].name && this.editForm.value.types[index].on_delete) {
        this.previewCategory.push(category)
        this.editForm.value.types[index].on_delete = false
      } else {
        this.previewCategory.splice(previewTempIndex, 1)
        this.editForm.value.types.splice(index, 1)
      }
    }
  }
  addSeance(event: any) {
    if (this.editForm.value.places[event].seances) {
      this.editForm.value.places[event].seances.push({
        temp_id: this.editForm.value.places[event].seances.length,
        date_start: '',
      })
    }
  }
  editSeance(seanceDate: any) {
    if (seanceDate.temp_id || (seanceDate.temp_id == 0 && seanceDate.temp_id != null)) {
      let seanceIndex = this.editForm.value.places[seanceDate.placeId].seances
        .map((e: any) => e.temp_id)
        .indexOf(seanceDate.temp_id)
      this.editForm.value.places[seanceDate.placeId].seances[seanceIndex].date_start = seanceDate.date_start
    } else if (!seanceDate.temp_id && seanceDate.seance) {
      let seanceIndex = this.editForm.value.places[seanceDate.placeId].seances
        .map((e: any) => e.id)
        .indexOf(seanceDate.seance.id)
      this.editForm.value.places[seanceDate.placeId].seances[seanceIndex].date_start = seanceDate.seance.date_start
    }
  }
  deleteSeance(seance: any) {
    if (seance.temp_id || (seance.temp_id == 0 && seance.temp_id != null)) {
      let seanceIndex = this.editForm.value.places[seance.placeId].seances
        .map((e: any) => e.temp_id)
        .indexOf(seance.temp_id)
      this.editForm.value.places[seance.placeId].seances.splice(seanceIndex, 1)
    } else {
      let seanceIndex = this.editForm.value.places[seance.placeId].seances
        .map((e: any) => e.id)
        .indexOf(seance.seance.id)
      this.editForm.value.places[seance.placeId].seances[seanceIndex].on_delete = true
    }
  }
  getPlaces() {
    let tempPlaceArray: IPlace[] = []
    console.log(this.event)
    this.eventsService
      .getEventPlaces(this.event.id, {})
      .pipe(
        tap((res: any) => {
          tempPlaceArray = res.places.data
        }),
      )
      .subscribe(() => {
        this.copyEvent.places = []
        tempPlaceArray.forEach((place: any) => {
          this.placesArray.push(place)
          if (this.copyEvent.places) {
            this.copyEvent.places.push(_.cloneDeep(place))
          }
          this.editForm.value.places.push(place)
        })
      })
  }
  addPlace() {
    let tempPlace = {
      temp_id: this.editForm.value.places.length,
      latitude: '',
      longitude: '',
      address: '',
      seances: [],
    }
    this.editForm.value.places.push(tempPlace)
  }
  deletePlace(placeId: any) {
    let place = this.editForm.value.places[placeId]
    if (place.id) {
      this.editForm.value.places[placeId].on_delete = true
    } else if (place.temp_id) {
      this.editForm.value.places.splice(placeId, 1)
    }
  }
  ionViewWillEnter() {
    let priceArray: any = []
    let typesArray: any = []
    let filesArray: any = []

    this.loadingService.showLoading()
    const eventId = this.routeActivated.snapshot.paramMap.get('id')
    this.eventsService
      .getEventById(Number(eventId))
      .pipe(
        takeUntil(this.destroy$),
        tap((res: any) => {
          console.log(res)
          res = res.event
          priceArray = res.price
          typesArray = res.types
          filesArray = JSON.parse(JSON.stringify(res.files))
          this.event = JSON.parse(JSON.stringify(res))
        }),
      )
      .subscribe((res: any) => {
        res = res.event
        this.copyEvent = _.cloneDeep(this.event)
        this.getPlaces()
        this.loadingService.hideLoading()
        this.editForm.patchValue({
          name: res.name,
          sponsor: res.sponsor,
          description: res.description,
        })
        if (priceArray) {
          priceArray.forEach((price: any) => {
            this.editForm.value.price.push(price)
          })
        }

        typesArray.forEach((type: any) => {
          this.previewCategory.push(type)
          this.editForm.value.types.push(type)
        })
        filesArray.forEach((file: any) => {
          this.editForm.value.files.push(JSON.parse(JSON.stringify(file)))
        })
      })
  }
  clearFormOfTempData() {
    // let tempForm = _.cloneDeep(this.editForm)
    if (this.editForm.value.price) {
      this.editForm.value.price.forEach((price: any) => {
        if (price.temp_id) {
          delete price.temp_id
        }
      })
    }
    if (this.editForm.value.types) {
      this.editForm.value.types.forEach((type: any) => {
        if (type.temp_id) {
          delete type.temp_id
        }
      })
    }

    if (this.editForm.value.places) {
      this.editForm.value.places.forEach((place: any) => {
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
  setEmptyPrice() {
    //Добавляю ноль в цену без суммы
    this.editForm.value.price.forEach((price: any) => {
      if (price.cost_rub == '') {
        price.cost_rub = 0
      }
    })
  }
  checkValidOfForm() {
    let typeCount = 0
    let priceCount = 0
    let placesCount = 0
    let fieldsValid = true
    this.invalidForm = {
      name: false,
      description: false,
      sponsor: false,
      types: false,
      places: false,
      seances: {
        error: false,
        message: [''],
      },
      price: false,
      addressPlace: false,
    }
    this.invalidForm.name = this.editForm.get('name')!.invalid
    this.invalidForm.description = this.editForm.get('description')!.invalid
    this.invalidForm.sponsor = this.editForm.get('sponsor')!.invalid
    this.editForm.value.types.forEach((type: any) => {
      if (!type.on_delete) {
        typeCount++
      }
    })
    this.invalidForm.types = typeCount == 0
    if (this.invalidForm.types) {
      this.toastService.showToast('Должна быть хотя бы одна категория', 'warning')
    }
    this.editForm.value.price
      .map((e: any) => e.on_delete)
      .forEach((price: any) => {
        if (!price) {
          priceCount++
        }
      })
    if (priceCount > 1) {
      this.editForm.value.price.forEach((price: any) => {
        if (price.descriptions === '' && !price.on_delete) {
          this.invalidForm.price = true
        }
      })
    }
    if (this.invalidForm.price) {
      this.toastService.showToast('Если у вас несколько билетов, то описание обязательно', 'warning')
    }
    this.editForm.value.places.forEach((place: any) => {
      if (!place.on_delete) {
        placesCount++
        let tempSeanceCount = 0
        place.seances
          .map((seance: any) => seance.on_delete)
          .forEach((seance: any) => {
            if (seance) {
              tempSeanceCount++
            }
          })

        if (tempSeanceCount == place.seances.length) {
          this.invalidForm.seances.error = true
          this.invalidForm.seances.message.push('Добавьте время проведения')
        }
        if (place.address == '') {
          this.invalidForm.addressPlace = true
        }
        //проверяем в сколких плейсах есть сеансы
        place.seances.forEach((seance: any) => {
          if (!seance.on_delete) {
            if (seance.date_start == '') {
              this.invalidForm.seances.error = true
              this.invalidForm.seances.message.push('Дата начала сеанса не может быть пустой')
            }
          }
        })
      }
    })

    if (this.invalidForm.seances.error == true) {
      this.invalidForm.seances.message.forEach((message: any) => {
        if (message !== '') {
          this.toastService.showToast(message, 'warning')
        }
      })
    }
    if (placesCount === 0) {
      this.invalidForm.places = true
    }
    if (this.invalidForm.places) {
      this.toastService.showToast('Добавьте место проведения ', 'warning')
    }
    if (this.invalidForm.addressPlace) {
      this.toastService.showToast('Адрес не может быть пустым', 'warning')
    }

    for (let key of Object.keys(this.invalidForm)) {
      if (typeof this.invalidForm[key as keyof typeof this.invalidForm] === 'boolean') {
        if (this.invalidForm[key as keyof typeof this.invalidForm]) {
          fieldsValid = false
        }
      }
    }
    if (fieldsValid && !this.invalidForm.seances.error) {
      return true
    } else {
      return false
    }
  }
  submitForm() {
    if (this.checkValidOfForm()) {
      if (this.submitButtonState) {
        return
      }
      // this.submitButtonState = true
      // this.loadingService.showLoading()
      this.clearFormOfTempData()
      let historyContent = new EventHistoryContent()
      let result = historyContent.merge(this.copyEvent, _.cloneDeep(this.editForm.value))
      this.editService
        .sendEditEvent(serialize(result, this.options))
        .pipe(
          catchError((err: any) => {
            this.submitButtonState = false
            this.loadingService.hideLoading()
            this.formData = new FormData()
            if (err.status == 403) {
              this.toastService.showToast('Событие уже находится на модерации', 'warning')
            } else {
              this.toastService.showToast('Что-то пошло не так', 'error')
            }
            return of(EMPTY)
          }),
        )
        .subscribe((res: any) => {
          this.formData = new FormData()
          this.submitButtonState = false
          this.loadingService.hideLoading()
          if (res.status == 'success') {
            this.toastService.showToast('Событие отправленно на проверку', 'success')
            this.router.navigate(['/cabinet/events'])
          }
        })
    }
  }
  ngOnInit() {
    this.editForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(3)]),
      files: new FormControl([]),
      price: new FormControl([], [Validators.required]),
      types: new FormControl([], [Validators.required]),
      places: new FormControl([], [Validators.required]),
    })
  }
}
