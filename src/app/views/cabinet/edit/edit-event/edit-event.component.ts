import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Subject, takeUntil, tap } from 'rxjs'
import { IEvent } from 'src/app/models/event'
import { EventsService } from 'src/app/services/events.service'
import { LoadingService } from 'src/app/services/loading.service'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit {
  constructor(
    private routeActivated: ActivatedRoute,
    private eventsService: EventsService,
    private loadingService: LoadingService, // LoadingService is injected
  ) {}
  private readonly destroy$ = new Subject<void>()
  event!: IEvent
  editForm!: FormGroup
  finalObject!: IEvent
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
    console.log(this.editForm.value.price)
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
      console.log(this.editForm.value.price)
    } else {
      let id = event.temp_id
      console.log(this.editForm.value.price)
      let index = this.editForm.value.price.map((e: any) => e.temp_id).indexOf(event.temp_id)
      this.editForm.value.price[index].cost_rub = event.cost_rub
      this.editForm.value.price[index].descriptions = event.descriptions
      this.editForm.value.price
    }
  }
  ionViewWillEnter() {
    let priceArray: any = []
    this.loadingService.showLoading()
    const eventId = this.routeActivated.snapshot.paramMap.get('id')
    this.eventsService
      .getEventById(Number(eventId))
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          priceArray = res.price
        }),
      )
      .subscribe((res: any) => {
        this.event = res
        console.log(res)
        this.loadingService.hideLoading()
        this.editForm.patchValue({
          name: res.name,
          sponsor: res.sponsor,
          description: res.description,
        })
        priceArray.forEach((price: any) => {
          console.log(priceArray)
          this.editForm.value.price.push(price)
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
    })
  }
}
