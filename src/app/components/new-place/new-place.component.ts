import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { IPlace } from 'src/app/models/place'

@Component({
  selector: 'app-new-place',
  templateUrl: './new-place.component.html',
  styleUrls: ['./new-place.component.scss'],
})
export class NewPlaceComponent implements OnInit {
  constructor() {}
  placeForm!: FormGroup
  @Output() seanceEmit = new EventEmitter()
  @Input() place!: any
  @Input() placeId!: any
  @Output() seanceDeleteEmit = new EventEmitter()
  seancesArray: any[] = []
  addSeance() {
    this.seanceEmit.emit(this.placeId)
  }
  seanceDelete(event: any) {
    console.log(event)
  }
  ngOnInit() {
    this.seancesArray = this.place.seances
    this.placeForm = new FormGroup({
      address: new FormControl('', [Validators.required]),
    })
  }
}
