import { Component, Input, OnInit, Output } from '@angular/core'
import { FormControl } from '@angular/forms'
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'app-standart-input',
  templateUrl: './standart-input.component.html',
  styleUrls: ['./standart-input.component.scss'],
})
export class StandartInputComponent implements OnInit {
  constructor() {}

  @Input() control?: any
  @Input() type: string = ''
  @Input() label: string = ''
  @Input() placeholder: string = ''
  @Input() readonly: boolean = false
  @Input() openPassword: boolean = false
  @Input() invalid: boolean = false
  @Input() disabled: boolean = false
  @Input() errorMessage: string = ''
  @Output() changeInput: EventEmitter<string> = new EventEmitter()
  emitInput(event: any): void {
    this.changeInput.emit(event)
  }

  ngOnChanges() {}
  openPasword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
  ngOnInit() {}
}
