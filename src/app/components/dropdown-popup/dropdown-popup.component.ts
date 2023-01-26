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

  // @Input()
  // // item: any
  
  @Input() headerLeftIco: boolean = false
  @Input() headerLeftIcoName: string = ''
  @Input() headerLeftIcoClass: string = 'pt-1 w-8 h-8 text-blue-500 pr-2'

  @Input() headertitle: string | {} = 'Header'

  @Input() headerRightIco: boolean = true
  @Input() headerRightIcoName: string = 'chevron-down'
  @Input() headerRightIcoClass: string = 'pt-1 w-8 h-8 pl-1'

  @Input() headerClass: string = 'flex items-center px-3 py-2 mx-3 mt-2 text-xl text-gray-500 font-bold cursor-pointer transition-colors duration-300 transform rounded-md lg:mt-0 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
  @Input() headerClassActive: string = 'bg-gray-100 dark:bg-gray-700'
  
  @Input() listClass: string = 'absolute right-0 z-20 w-full py-2 mt-2 origin-top-right bg-white rounded-md shadow-2xl dark:bg-gray-800'
  @Input() listItems: any[] = [
              {
                route: null,
                icon: '',
                title: 'item'
              }
            ]
  @Input() itemIco: boolean = false
  @Input() itemIcoClass: string = 'pt-1 w-5 h-5 text-blue-500 pr-2'
  @Input() itemTitleClass: string = 'mx-1'
  @Input() routeActiveClass: string[] = ['bg-gray-100', 'dark:bg-gray-700']
  @Input() itemClass: string = 'flex items-center px-3 py-3 text-lg text-gray-600 font-bold  transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'


  constructor(private router: Router) { }

  isOpened: boolean = false 

  onToggle(): void {
    this.isOpened = !this.isOpened
  } 

  clickedOutside(): void {
    this.isOpened = false 
  } 

  public isLContactsChildLinkActive(): boolean {
    return this.router.isActive('/contacts/support', true) || this.router.isActive('/contacts/feedback', true);
  }

  ngOnInit() {
 
  }

}
