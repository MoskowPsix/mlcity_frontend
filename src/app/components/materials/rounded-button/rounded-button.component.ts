import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

@Component({
  selector: 'app-rounded-button',
  templateUrl: './rounded-button.component.html',
  styleUrls: ['./rounded-button.component.scss'],
})
export class RoundedButtonComponent implements OnInit {
  constructor() {}
  @Input() buttonText: String = ''
  @Input() icon: String = ''
  @Input() type: String = ''
  @Input() theme: String = ''
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>()
  @Input() disabled: boolean = false
  onClick() {
    this.clicked.emit()
  }

  ngOnInit() {}
}
