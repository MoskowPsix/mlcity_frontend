import { Component, OnInit } from '@angular/core';
import * as menuPublic from '../../data/menu-public.json';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  menuPublic:any = (menuPublic as any).default;
  
  constructor() { }

  ngOnInit() {}

}
