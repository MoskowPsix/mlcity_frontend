import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

@Component({
  selector: 'app-new-seance',
  templateUrl: './new-seance.component.html',
  styleUrls: ['./new-seance.component.scss'],
})
export class NewSeanceComponent implements OnInit {
  constructor() {}

  @Input() control?: any
  @Input() type: string = ''
  @Input() label: string = ''
  @Input() placeholder: string = ''
  @Input() readonly: boolean = false
  @Input() openPassword: boolean = false
  @Input() invalid: boolean = false
  @Input() disabled: boolean = false
  @Input() value: string = ''
  @Input() placeId!: number
  @Input() seance: any
  @Input() step: any
  @Output() seanceDeleteEmit = new EventEmitter()
  @Output() seanceEditEmit = new EventEmitter()

  openPasword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
  getSeanceDate(time: any) {
    if (!this.seance.id) {
      this.seanceEditEmit.emit({
        temp_id: this.seance.temp_id,
        placeId: this.placeId,
        date_start: time.target.value,
      })
    } else {
      this.seance.date_start = time.target.value
      this.seanceEditEmit.emit({
        placeId: this.placeId,
        seance: this.seance,
      })
    }
  }
  seanceDelete() {
    if (!this.seance.id) {
      this.seanceDeleteEmit.emit({
        temp_id: this.seance.temp_id,
        placeId: this.placeId,
      })
    } else {
      this.seanceDeleteEmit.emit({
        placeId: this.placeId,
        seance: this.seance,
      })
    }
  }
  ngOnInit() {}
}
