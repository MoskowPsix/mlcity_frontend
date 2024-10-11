import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { IPrice } from 'src/app/models/price'

@Component({
  selector: 'app-new-price',
  templateUrl: './new-price.component.html',
  styleUrls: ['./new-price.component.scss'],
})
export class NewPriceComponent implements OnInit {
  constructor() {}
  public pricesForm!: FormGroup
  @Input() priceId!: number
  @Input() cost_rub!: string
  @Input() descriptions!: string
  @Input() price!: any
  @Input() form!: FormGroup
  @Output() deletePriceEmit: EventEmitter<any> = new EventEmitter()
  @Output() addPriceEmit: EventEmitter<any> = new EventEmitter()
  setPrice(event?: any) {
    this.addPriceEmit.emit(this.pricesForm.value)
  }
  deletePrice() {
    this.deletePriceEmit.emit(this.price)
  }
  ngOnInit() {
    if (!this.price.id) {
      this.pricesForm = new FormGroup({
        temp_id: new FormControl(this.price.temp_id),
        cost_rub: new FormControl(this.price.cost_rub, [Validators.required, Validators.minLength(3)]),
        descriptions: new FormControl(this.price.descriptions, [Validators.required, Validators.minLength(3)]),
      })
    } else {
      this.pricesForm = new FormGroup({
        id: new FormControl(this.price.id),
        cost_rub: new FormControl(this.price.cost_rub, [Validators.required, Validators.minLength(3)]),
        descriptions: new FormControl(this.price.descriptions, [Validators.required, Validators.minLength(3)]),
      })
    }
  }
}
