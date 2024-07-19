import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { IUser } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { UserService } from 'src/app/services/user.service'
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
  platformType: string = Capacitor.getPlatform()

  onLogout() {
    this.authService.logout()
  }
  navigateToSettings() {
    this.router.navigate(['cabinet/settings'])
  }

  ngOnInit() {
    this.userService
      .getUserById()
      .pipe()
      .subscribe((res: any) => {
        this.user = res.user
        console.log(res.user)
      })
  }
}
