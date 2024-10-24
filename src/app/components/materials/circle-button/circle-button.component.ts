import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

@Component({
  selector: 'app-circle-button',
  templateUrl: './circle-button.component.html',
  styleUrls: ['./circle-button.component.scss'],
})
export class CircleButtonComponent implements OnInit {
  constructor() {}
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>()
  @Input() icon: string = ''
  @Input() border: string = ''
  @Input() changeColor!: string
  @Input() disabled?: boolean
  @Input() loading: boolean = false
  click() {
    this.clicked.emit()
  }
  ngOnInit() {}
}
