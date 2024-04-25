import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-cabinet',
  templateUrl: './cabinet.component.html',
  styleUrls: ['./cabinet.component.scss'],
})
export class CabinetComponent {
  constructor(private authService: AuthService) {}

  platformType: any = Capacitor.getPlatform();

  onLogout() {
    this.authService.logout();
  }
}
