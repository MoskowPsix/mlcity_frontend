import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-button',
  templateUrl: './search-button.component.html',
  styleUrls: ['./search-button.component.scss'],
})
export class SearchButtonComponent  implements OnInit {
  constructor() { }
  active: boolean = false
  wait: boolean = false
  changeInput(event: HTMLInputElement){
    if (!this.wait) {
      this.wait = true
      setTimeout(()=>{
        this.wait = false
      },500)

      if (this.active) {
        console.log(event)
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
              console.log(inputValue)
          }
          })
        }, 500)
          event.style.opacity = '1'
      }
      this.active = !this.active
    }
    }

  ngOnInit() {}

}
