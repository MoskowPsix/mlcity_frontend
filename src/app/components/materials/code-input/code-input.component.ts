import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewChildren,
  AfterViewInit,
  HostListener,
} from '@angular/core'

@Component({
  selector: 'app-code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss'],
})
export class CodeInputComponent implements OnInit, AfterViewInit {
  constructor() {}
  @ViewChildren('item') items: any
  @ViewChild('setButton') setButton: any
  itemsArray!: ElementRef[]
  @Input() setFocused!: boolean
  codeCount: number[] = Array(4).fill(0)
  @HostListener('keydown.backspace') undo() {
    console.log('контрол')
  }
  ngAfterViewInit(): void {
    // for (let i = 0; i < 4; i++) {
    //   this.setButton.nativeElement.click()
    // this.setFocusInput()
    setTimeout(() => {
      this.items.first.nativeElement.focus()
    }, 0)
    // }
  }
  setFocusInput() {
    let item: HTMLElement = this.itemsArray[0].nativeElement
    item.focus()
    this.itemsArray.forEach((item) => {})
  }
  nextFocus(event: any) {
    console.log(event.keycode)
    if (event.data !== null) {
      if (Number(event.target.id) + 1 < this.items.length) {
        console.log(Number(event.target.id) + 1)
        this.items.toArray()[Number(event.target.id) + 1].nativeElement.focus()
        this.itemsArray = this.items.toArray()
      } else {
        this.items.toArray()[0].nativeElement.focus()
      }
    } else {
      if (Number(event.target.id) + 1 < 0) {
        this.items.toArray()[Number(event.target.id) - 1].nativeElement.focus()
        this.itemsArray = this.items.toArray()
      } else {
        this.items.last.focus()
      }
    }

    console.log()
  }
  ngOnInit(): void {
    // this.items.first.nativeElement.setFocus()
  }
}
