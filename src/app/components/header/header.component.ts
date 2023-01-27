import { Component, OnInit } from '@angular/core';
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenu } from 'src/app/models/menu';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
   menuPublic: IMenu[] = []
   appName = environment.APP_NAME

  constructor() { }

  ngOnInit() {
    this.menuPublic = menuPublicData
  }

}
