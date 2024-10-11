import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import menuPublicData from '../../../assets/json/menu-public.json'
import { IMenu } from 'src/app/models/menu'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  menuPublic: IMenu[] = []

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  onLogout() {
    this.authService.logout()
  }

  public isLChildLinkActive(): boolean {
    return (
      this.router.isActive('/contacts/support', true) ||
      this.router.isActive('/contacts/feedback', true)
    )
  }

  ngOnInit() {
    this.menuPublic = menuPublicData
  }
}
