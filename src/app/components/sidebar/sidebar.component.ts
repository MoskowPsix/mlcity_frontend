import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router';
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenuPublic } from 'src/app/models/menu-public'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})

export class SidebarComponent implements OnInit {
  menuPublic: IMenuPublic[] = []

  constructor(private router: Router) { }
  
  public isLChildLinkActive(): boolean {
    return this.router.isActive('/contacts/support', true) || this.router.isActive('/contacts/feedback', true);
  }

  ngOnInit() {
    this.menuPublic = menuPublicData
  }

}
