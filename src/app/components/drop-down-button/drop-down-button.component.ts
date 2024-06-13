import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core'

import { timer } from 'rxjs'

@Component({
  selector: 'app-drop-down-button',
  templateUrl: './drop-down-button.component.html',
  styleUrls: ['./drop-down-button.component.scss'],
})
export class DropDownButtonComponent {
  constructor() {}
  firstCircleClass: string = 'first'
  secondCircleClass: string = 'second'
  thirdCircleClass: string = 'third'
  timerRun: boolean = false
  timerId: any = ''
  @Output() emmitter = new EventEmitter()
  @Input() iconsPathArray: string[] = []
  @Input() mapClick: boolean = false
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    let target = event.target as HTMLElement
    if (target.getAttribute('name') !== 'dropButton') {
      this.close()
    }
  }
  sendButtonId(event: any) {
    this.emmitter.emit(event.target.id)
  }

  menuDrop() {
    if (this.firstCircleClass === 'first') {
      this.firstCircleClass = 'first_active'
      this.secondCircleClass = 'second_active'
      this.thirdCircleClass = 'third_active'
      this.timerBtn()
    } else {
      this.firstCircleClass = 'first'
      this.secondCircleClass = 'second'
      this.thirdCircleClass = 'third'
      clearTimeout(this.timerId)
      this.timerRun = false
    }
  }

  close() {
    this.firstCircleClass = 'first'
    this.secondCircleClass = 'second'
    this.thirdCircleClass = 'third'
  }

  timerBtn() {
    if (!this.timerRun) {
      this.timerRun = true
      this.timerId = setTimeout(() => {
        this.firstCircleClass = 'first'
        this.secondCircleClass = 'second'
        this.thirdCircleClass = 'third'
        this.timerRun = false
      }, 3000)
    }
  }
}
