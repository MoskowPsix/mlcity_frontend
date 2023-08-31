import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, AUTO_STYLE } from '@angular/animations';

@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss'],
  animations: [
    // trigger('collapse', [
    //   state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
    //   state('true', style({ height: '0', visibility: 'hidden' })),
    //   transition('false => true', animate(300 + 'ms ease-in')),
    //   transition('true => false', animate(300 + 'ms ease-out'))
    // ])

    trigger('collapse', [
      state('false', style({ height: '0px', overflow: 'hidden' })),
      state('true', style({ height: AUTO_STYLE, overflow: 'hidden'})),
      transition('true <=> false', animate('500ms ease-in-out')),
    ]),
    
  ]
})
export class ReadMoreComponent implements OnInit {

  readMore: boolean = false
  collapsed = false
  showToggle: boolean = false
  @Input() text:string = ''
  @Input() long:number  = 200
  

  constructor() { }

  toggle() {
    this.collapsed = !this.collapsed
  }

  ngOnInit() {
    if (this.text.length > this.long) {
      this.showToggle = true
    } else {
      this.showToggle = false
    }
  }

}
