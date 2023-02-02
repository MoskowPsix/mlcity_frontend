import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dropdown-popup',
  templateUrl: './dropdown-popup.component.html',
  styleUrls: ['./dropdown-popup.component.scss'],
})
export class DropdownPopupComponent implements OnInit {

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
                children: []
              }
            ]
  @Input() itemIco: boolean = false

  constructor(private router: Router, private authService: AuthService) { }

  onLogout(){
    this.authService.logout()
  }

  public isLContactsChildLinkActive(): boolean {
    return this.router.isActive('/contacts/support', true) || this.router.isActive('/contacts/feedback', true);
  }

  ngOnInit() {

  }

}
