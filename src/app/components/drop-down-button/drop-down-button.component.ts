import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-drop-down-button',
  templateUrl: './drop-down-button.component.html',
  styleUrls: ['./drop-down-button.component.scss'],
})
export class DropDownButtonComponent implements OnInit {
  constructor() {}
  firstCircleClass: string = 'first'
  secondCircleClass: string = 'second'
  thirdCircleClass: string = 'third'
  @Output() emmitter = new EventEmitter()
  @Input() iconsPathArray: string[] = []

  sendButtonId(event: any) {
    this.emmitter.emit(event.target.id)
  }

  menuDrop() {
    if (this.firstCircleClass === 'first') {
      this.firstCircleClass = 'first_active'
      this.secondCircleClass = 'second_active'
      this.thirdCircleClass = 'third_active'
    } else {
      this.firstCircleClass = 'first'
      this.secondCircleClass = 'second'
      this.thirdCircleClass = 'third'
    }
  }
  ngOnInit() {}
}
