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
  @Input() placeId!: number
  @Input() seance: any
  @Output() seanceDeleteEmit = new EventEmitter()

  openPasword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
  seanceDelete() {
    this.seanceDeleteEmit.emit({
      id: this.seance.tempId,
      placeId: this.placeId,
    })
  }
  ngOnInit() {}
}
