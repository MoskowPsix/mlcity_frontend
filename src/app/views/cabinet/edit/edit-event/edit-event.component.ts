import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Subject, takeUntil, tap } from 'rxjs'
import { IEvent } from 'src/app/models/event'
import { EventsService } from 'src/app/services/events.service'
import { LoadingService } from 'src/app/services/loading.service'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
import { EventTypeService } from 'src/app/services/event-type.service'
import { IEventType } from 'src/app/models/event-type'
import { environment } from 'src/environments/environment'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { IPlace } from 'src/app/models/place'
@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit {
  constructor(
    private eventTypeService: EventTypeService,
    private routeActivated: ActivatedRoute,
    private eventsService: EventsService,
    private loadingService: LoadingService,
    private queryBuilderService: QueryBuilderService,
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
  logFiles(event: any) {
    this.finalObject.files = event
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
        .pipe()
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
    console.log(event)
    this.placesArray[event].seances.push({
      tempId: this.placesArray[event].seances.length,
    })
  }
  getPlaces() {
    console.log(this.event.id)
    let tempPlaceArray: IPlace[] = []
    this.eventsService
      .getEventPlaces(this.event.id, {})
      .pipe(
        tap((res: any) => {
          tempPlaceArray = res.places.data
        }),
      )
      .subscribe((res) => {
        tempPlaceArray.forEach((place: any) => {
          this.placesArray.push(place)
          this.editForm.value.places.push(place)
        })
      })
  }
  ionViewWillEnter() {
    let priceArray: any = []
    let typesArray: any = []
    this.loadingService.showLoading()
    const eventId = this.routeActivated.snapshot.paramMap.get('id')
    this.eventsService
      .getEventById(Number(eventId))
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          priceArray = res.price
          typesArray = res.types
          this.event = res
        }),
      )
      .subscribe((res: any) => {
        this.getPlaces()
        this.loadingService.hideLoading()
        this.editForm.patchValue({
          name: res.name,
          sponsor: res.sponsor,
          description: res.description,
        })
        priceArray.forEach((price: any) => {
          this.editForm.value.price.push(price)
        })
        typesArray.forEach((type: any) => {
          this.previewCategory.push(type)
          this.editForm.value.types.push(type)
        })
      })
  }
  logFunction() {
    console.log(this.editForm.value)
  }
  ngOnInit() {
    this.editForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(3)]),
      files: new FormControl('', fileTypeValidator(['png', 'jpg', 'jpeg'])),
      price: new FormControl([], [Validators.required]),
      types: new FormControl([], [Validators.required]),
      places: new FormControl([], [Validators.required]),
    })
  }
}
