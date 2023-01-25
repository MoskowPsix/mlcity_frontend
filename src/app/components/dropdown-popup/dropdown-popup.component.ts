import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dropdown-popup',
  templateUrl: './dropdown-popup.component.html',
  styleUrls: ['./dropdown-popup.component.scss'],
  // animations: [ 
  //   trigger('opacityScale', [
  //     transition(':enter', [
  //         style({ opacity: 0, transform: 'scale(.95)' }),
  //         animate('100ms ease-out', style({  opacity: 1, transform: 'scale(1)' }))
  //     ]),
  //     transition(':leave', [
  //         style({ opacity: 1, transform: 'scale(1)' }),
  //         animate('75ms ease-in', style({ opacity: 0, transform: 'scale(.95)' }))
  //     ])
  //   ])
  // ]
})
export class DropdownPopupComponent implements OnInit {

  @Input()
  item: any
  

  constructor(private router: Router) { }

  isOpened: boolean = false 

  onToggle(): void {
    this.isOpened = !this.isOpened
  } 

  clickedOutside(): void {
    this.isOpened = false 
  } 

  public isLChildLinkActive(): boolean {
    return this.router.isActive('/contacts/support', true) || this.router.isActive('/contacts/feedback', true);
  }

  ngOnInit() {
 
  }

}
