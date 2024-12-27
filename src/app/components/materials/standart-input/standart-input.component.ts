import { Component, Input, OnInit, Output } from '@angular/core'
import { FormControl } from '@angular/forms'
import metadata from 'libphonenumber-js/min/metadata'
import { EventEmitter } from '@angular/core'
import { MaskitoMask, MaskitoOptions } from '@maskito/core'

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
  @Input() maskType!: string
  @Input() openPassword: boolean = false
  @Input() invalid: boolean = false
  @Input() disabled: boolean = false
  mask: MaskitoMask = new RegExp('')
  optionMask: MaskitoOptions = {
    mask: this.mask,
  }
  @Input() errorMessage: string = ''
  @Output() changeInput: EventEmitter<string> = new EventEmitter()
  emitInput(event: any): void {
    this.changeInput.emit(event)
  }

  renderMask() {
    if (this.maskType == 'phone') {
      console.log('маска для телефона')
      this.optionMask = {
        mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
      }
    } else {
    }
  }

  ngOnChanges() {}
  openPasword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
  ngOnInit() {
    this.renderMask()
  }
}
function maskitoPhoneOptionsGenerator(arg0: {
  countryIsoCode: string
  metadata: any
}): import('@maskito/core').MaskitoMask {
  throw new Error('Function not implemented.')
}
