import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-exit-button',
  templateUrl: './exit-button.component.html',
  styleUrls: ['./exit-button.component.scss'],
})
export class ExitButtonComponent  implements OnInit {

  constructor(private authService:AuthService) { }
  onLogout() {
    this.authService.logout()
  }
  ngOnInit() {}

}
