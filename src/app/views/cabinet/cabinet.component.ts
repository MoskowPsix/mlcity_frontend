import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { Subject, takeUntil } from 'rxjs'
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
  private readonly destroy$ = new Subject<void>()
  onLogout() {
    this.authService.logout()
  }
  navigateToSettings() {
    this.router.navigate(['cabinet/settings'])
  }
  ionViewWillEnter() {
    this.userService
      .getUserById()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.user = res.user
        console.log(res.user)
      })
  }

  ngOnInit() {
    this.userService
      .getUserById()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.user = res.user
        console.log(res.user)
      })
  }
}
