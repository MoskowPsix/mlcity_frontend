import { Component, OnInit } from '@angular/core';
import * as menuPublic from '../../data/menu-public.json';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
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
export class HeaderComponent implements OnInit {
  menuPublic:any = (menuPublic as any).default;

  constructor() { }

  ngOnInit() {

  }

}
