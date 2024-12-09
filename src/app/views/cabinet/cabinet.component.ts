import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { Subject, takeUntil } from 'rxjs'
import { IUser } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { UserService } from 'src/app/services/user.service'
import { Device } from '@capacitor/device'
@Component({
  selector: 'app-cabinet',
  templateUrl: './cabinet.component.html',
  styleUrls: ['./cabinet.component.scss'],
})
export class CabinetComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {}
  user!: IUser
  test: string = 'test'
  appVersion: any = ''
  platformType: string = Capacitor.getPlatform()
  private readonly destroy$ = new Subject<void>()
  onLogout() {
    this.authService.logout()
  }
  navigateToSettings() {
    this.router.navigate(['cabinet/settings'])
  }
  ionViewWillEnter() {
    this.user = this.userService.getUserFromLocalStorage()
    this.platformType = Capacitor.getPlatform()
    if (this.platformType == 'web') {
      Device.getInfo().then((device: any) => {
        console.log(device)
        
        if (device.appVersion) {
          this.appVersion = device.appVersion
        }
      })
    }
  }

  ngOnInit() {
    this.user = this.userService.getUserFromLocalStorage()
  }
}
