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
  @Output() seanceEditEmit = new EventEmitter()
  @Output() placeDeleteEmit = new EventEmitter()
  @Output() placeEditEmit = new EventEmitter()
  @Output() addressEditEmit = new EventEmitter()
  seancesArray: any[] = []
  seanceEdit(seance: any) {
    this.seanceEditEmit.emit(seance)
  }
  addSeance() {
    this.seanceEmit.emit(this.placeId)
  }
  seanceDelete(event: any) {
    this.seanceDeleteEmit.emit(event)
  }
  deletePlace() {
    this.placeDeleteEmit.emit(this.placeId)
  }
  edditAdress(event: any) {
    this.addressEditEmit.emit(event)
  }
  checkCountSeances() {
    if (this.seancesArray.map((e: any) => e.on_delete).indexOf(undefined) == -1) {
      return true
    } else {
      return false
    }
  }
  ngOnInit() {
    this.place ? (this.seancesArray = this.place.seances) : null
    this.placeForm = new FormGroup({
      address: new FormControl('', [Validators.required]),
    })
    if (this.place && !this.place.id) {
      this.addSeance()
    }
  }
}
