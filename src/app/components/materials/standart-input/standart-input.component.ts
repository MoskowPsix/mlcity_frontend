import { Component, Input, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'

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

  ngOnChanges() {}
  openPasword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
  ngOnInit() {}
}
