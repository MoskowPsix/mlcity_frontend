import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChange,
  SimpleChanges,
  HostListener,
} from '@angular/core'

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
    } else {
      this.firstCircleClass = 'first'
      this.secondCircleClass = 'second'
      this.thirdCircleClass = 'third'
    }
  }

  close() {
    this.firstCircleClass = 'first'
    this.secondCircleClass = 'second'
    this.thirdCircleClass = 'third'
  }

  ngOnInit() {}
}
