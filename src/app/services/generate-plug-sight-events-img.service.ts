import { ElementRef, Injectable } from '@angular/core'

// @Injectable({
//   providedIn: 'root',
// })
export class GeneratePlugSightEventsImgService {
  constructor(
    public block: ElementRef,
    public src: string,
  ) {}
  public mainBlock: HTMLElement = this.block.nativeElement

  generatePlug() {
    let wrapper: HTMLElement = document.createElement('div')
    wrapper.style.width = '100px'
    wrapper.style.height = '100px'
    wrapper.style.background = '#D9D9D9'
    if (this.mainBlock) {
      this.mainBlock.appendChild(wrapper)
    }
  }
}
