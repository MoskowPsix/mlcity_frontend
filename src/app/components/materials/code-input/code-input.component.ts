import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewChildren,
  AfterViewInit,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core'
import { MaskitoOptions } from '@maskito/core'
import {
  maskitoNumberOptionsGenerator,
  maskitoTimeOptionsGenerator,
} from '@maskito/kit'
import { UserService } from 'src/app/services/user.service'
@Component({
  selector: 'app-code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss'],
})
export class CodeInputComponent implements OnInit, AfterViewInit {
  constructor(private userService: UserService) {}
  @ViewChildren('item') items: any
  @ViewChild('setButton') setButton: any
  itemsArray!: ElementRef[]
  timerInterval: any
  dontFirstTimer: boolean = false
  @Input() setFocused!: boolean
  @Input() timerSecondsCount!: number
  @Output() code = new EventEmitter<String>()
  @Output() codeRetry = new EventEmitter<String>()
  public currentItem: number = 0
  public timer: number = 0
  public timerWait: boolean = false
  public maskInput: MaskitoOptions = {
    mask: [/\d/],
  }

  codeCount: number[] = Array(4).fill(0)

  @HostListener('keydown.backspace') undo() {
    let itemsArray = this.items.toArray()
    if (this.currentItem > -1) {
      itemsArray[this.currentItem].nativeElement.focus()
      this.currentItem = this.currentItem - 1
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.setFocused) {
        this.items.first.nativeElement.focus()
        this.currentItem = Number(this.items.first.nativeElement.id)
      }
    }, 0)
  }
  timerStart() {
    if (this.timer == 0 && !this.timerWait) {
      this.timerWait = true
      this.timer = this.timerSecondsCount
      if (this.dontFirstTimer) {
        this.codeRetry.emit()
      }

      this.timerInterval = setInterval(() => {
        if (this.timer > 1) {
          this.timer--
        } else {
          this.timerWait = false
          this.timer = 0
          this.dontFirstTimer = true
          clearInterval(this.timerInterval)
        }
      }, 1000)
    }
  }
  setFocusInput() {
    let item: HTMLElement = this.itemsArray[0].nativeElement
    item.focus()
    this.itemsArray.forEach((item) => {})
  }
  setCurentItemForClick(event: any) {
    this.currentItem = Number(event.target.id)
  }
  nextFocus(event: any) {
    if (event.data !== null) {
      if (Number(event.target.id) + 1 < this.items.length) {
        this.currentItem = Number(event.target.id) + 1
        this.items.toArray()[Number(event.target.id) + 1].nativeElement.focus()
        this.itemsArray = this.items.toArray()
      } else {
      }
    }
  }
  setCode() {
    this.itemsArray = this.items.toArray()
    let code = ''
    this.itemsArray.forEach((item: any) => {
      code += item.nativeElement.value
    })
    this.code.emit(code)
  }
  ngOnInit(): void {
    this.dontFirstTimer = false
    this.timerStart()
  }
}
