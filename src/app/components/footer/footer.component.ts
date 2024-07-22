import { Component, HostListener, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { EMPTY, Observable } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'
import { FilterService } from 'src/app/services/filter.service'
import { UserService } from 'src/app/services/user.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  eventCount: any
  sightCount: any

  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`

  isAuth: boolean = false
  avatarUrl!: string
  user!: any
  mobile: boolean = false
  currentRout = this.router
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    //private authService: AuthService,
  ) {}

  @HostListener('window:resize', ['$event'])
  mobileOrNote() {
    if (window.innerWidth < 900) {
      this.mobile = true
    } else if (window.innerWidth > 900) {
      this.mobile = false
    } else {
      this.mobile = false
    }
  }
  checkAuthenticated() {
    this.authService.authenticationState.subscribe((res: boolean) => {
      this.isAuth = res
    })
  }
  getUser() {
    this.userService.getUser().subscribe((user) => {
      this.user = user
      if (user) {
        if (user.avatar) {
          if (user.avatar.includes('https')) {
            this.avatarUrl = user.avatar
          } else {
            this.avatarUrl = `${this.backendUrl}${user.avatar}`
          }
        }
      }
    })
  }



  ngOnInit() {
    this.getUser()
    this.checkAuthenticated()
    this.mobileOrNote()
  }
}
