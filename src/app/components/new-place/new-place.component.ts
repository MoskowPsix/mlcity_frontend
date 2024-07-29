import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'app-new-place',
  templateUrl: './new-place.component.html',
  styleUrls: ['./new-place.component.scss'],
})
export class NewPlaceComponent implements OnInit {
  constructor() {}
  placeForm!: FormGroup
  ngOnInit() {
    this.placeForm = new FormGroup({
      address: new FormControl('', [Validators.required]),
    })
  }
}
