import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-standart-rich-input',
  templateUrl: './standart-rich-input.component.html',
  styleUrls: ['./standart-rich-input.component.scss'],
})
export class StandartRichInputComponent implements OnInit {
  @Input() control?: any
  @Input() type: string = ''
  @Input() label: string = ''
  @Input() placeholder: string = ''
  @Input() readonly: boolean = false
  @Input() openPassword: boolean = false
  @Input() invalid: boolean = false
  @Input() disabled: boolean = false

  openPasword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password'
  }
  ngOnInit() {}
}
