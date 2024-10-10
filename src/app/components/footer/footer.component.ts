import { Component, HostListener, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FooterMenu } from 'src/app/models/footer-menu'
import { AuthService } from 'src/app/services/auth.service'
import { UserService } from 'src/app/services/user.service'
import { environment } from 'src/environments/environment'
import footerMenuData from '../../../assets/json/menu-footer.json'

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
  menu!: FooterMenu[]
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

  isActiveRoute(path: string): boolean {
    if (
      this.router.url.includes(path) ||
      this.router.url.includes('sights') ||
      this.router.url.includes('events')
    ) {
      return true
    }
    return false
  }

  ngOnInit() {
    this.menu = footerMenuData
    this.getUser()
    this.checkAuthenticated()
    this.mobileOrNote()
  }
}
