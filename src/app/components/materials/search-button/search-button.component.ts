import { Router } from '@angular/router'
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { promises } from 'dns'

@Component({
  selector: 'app-search-button',
  templateUrl: './search-button.component.html',
  styleUrls: ['./search-button.component.scss'],
})
export class SearchButtonComponent implements OnInit {
  constructor(private render: Renderer2) {}
  @Input() active: boolean = false
  @Input() value: string = ''
  @Output() changeState: EventEmitter<any> = new EventEmitter()
  @Output() changeSearch: EventEmitter<string> = new EventEmitter()
  @ViewChild('input') input!: ElementRef
  subscribesInput: boolean = false
  searchButtonClass: string = 'search-button'
  inputWrapperClass: string = 'input-wrapper_litle'
  wait: boolean = false

  emitState() {
    this.changeState.emit(this.active)
  }

  renderActive() {
    let event = this.input.nativeElement
    if (this.active) {
      this.searchButtonClass = 'search-button_active'
      setTimeout(() => {
        this.inputWrapperClass = 'input-wrapper'
        if (!this.subscribesInput) {
          this.subscribesInput = true
          event.addEventListener('keypress', (key: any) => {
            if (key.key === 'Enter') {
              const inputValue = event.value
              this.changeSearch.emit(event.value)
            }
          })
        }
      }, 100)
      event.focus()
    }
  }
  renderNonActive() {
    let event = this.input.nativeElement
    if (!this.active) {
      this.inputWrapperClass = 'input-wrapper_litle'
      setTimeout(() => {
        this.searchButtonClass = 'search-button'
      }, 100)
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.input && this.input.nativeElement) {
      if (this.active) {
        this.renderActive()
      } else {
        this.renderNonActive()
      }
    }
  }

  ngAfterViewInit() {
    if (!this.subscribesInput) {
      this.subscribesInput = true
      this.render.listen(this.input.nativeElement, 'keypress', (key) => {
        if (key.key === 'Enter') {
          this.changeSearch.emit(this.input.nativeElement.value)
        }
      })
    }
  }
  ngOnInit() {}
}
