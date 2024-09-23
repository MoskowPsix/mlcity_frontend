import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'

@Component({
  selector: 'app-standart-button',
  templateUrl: './standart-button.component.html',
  styleUrls: ['./standart-button.component.scss'],
})
export class StandartButtonComponent implements OnInit {
  constructor() {}
  @Input() buttonText: String = ''
  @Input() icon: String = ''
  @Input() type: String = ''
  @Input() theme: String = ''
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>()
  @ViewChild('button') btn!: ElementRef
  @Input() disabled: boolean = false
  buttonSize: any = ''
  onClick() {
    this.clicked.emit()
  }

  ngOnInit() {}
}
