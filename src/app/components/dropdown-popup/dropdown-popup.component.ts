import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { AuthService } from 'src/app/services/auth.service'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-dropdown-popup',
  templateUrl: './dropdown-popup.component.html',
  styleUrls: ['./dropdown-popup.component.scss'],
})
export class DropdownPopupComponent {
  @Input() id: string = ''

  @Input() headerLeftIco: boolean = false
  @Input() headerLeftIcoName: string = ''

  @Input() headertitle: string | {} = 'Header'

  @Input() headerRightIco: boolean = true
  @Input() headerRightIcoName: string = 'chevron-down'

  @Input() listItems: any[] = [
    {
      route: null,
      icon: '',
      title: 'item',
      children: [],
    },
  ]
  @Input() itemIco: boolean = false
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/login/${localStorage.getItem('auth-token')}`

  platformType: any = Capacitor.getPlatform()

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  onLogout() {
    this.authService.logout()
  }

  public isLContactsChildLinkActive(): boolean {
    return (
      this.router.isActive('/contacts/support', true) ||
      this.router.isActive('/contacts/feedback', true)
    )
  }
}
