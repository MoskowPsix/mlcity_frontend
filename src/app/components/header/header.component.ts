import { Component, OnInit } from '@angular/core';
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenuPublic } from 'src/app/models/menu-public';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
   menuPublic: IMenuPublic[] = []

  constructor() { }

  ngOnInit() {
    this.menuPublic = menuPublicData
  }

}
