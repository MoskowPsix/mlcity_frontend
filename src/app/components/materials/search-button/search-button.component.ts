import { Router } from '@angular/router';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search-button',
  templateUrl: './search-button.component.html',
  styleUrls: ['./search-button.component.scss'],
})
export class SearchButtonComponent  implements OnInit {
  constructor(private render: Renderer2) {}
  @Input() active: boolean = false
  @Input() value: string = ''
  @Output() changeState: EventEmitter<any> = new EventEmitter()
  @Output() changeSearch: EventEmitter<string> = new EventEmitter()
  @ViewChild('input') input!: ElementRef
  wait: boolean = false

  changeInput(event: HTMLInputElement){
    if (!this.wait) {
      this.wait = true
      setTimeout(() =>{
        this.wait = false
      },500)

      if (this.active) {
        setTimeout(()=>{
          event.style.pointerEvents = 'none'
        }, 500)
        setTimeout(()=>{
             event.style.opacity = '0'
        },280)

      } else {
        setTimeout(() => {
          event.style.pointerEvents = 'all'
          event.focus()
          event.addEventListener('keypress', (key) => {
            if (key.key === 'Enter') {
              const inputValue = event.value
              this.changeSearch.emit(event.value)
          }
          })
        }, 500)
          event.style.opacity = '1'
      }
      this.changeState.emit()
    }
    }

  ngAfterViewInit() {
    this.render.listen(this.input.nativeElement, 'keypress', (key) => {
      if (key.key === 'Enter') {
        this.changeSearch.emit(this.input.nativeElement.value)
    }
    })
  }
  ngOnInit() {}

}
