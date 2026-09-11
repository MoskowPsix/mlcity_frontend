import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { FooterMenu } from 'src/app/models/footer-menu'
import { AuthService } from 'src/app/services/auth.service'
import { MobileOrNoteService } from 'src/app/services/mobile-or-note.service'
import { UserService } from 'src/app/services/user.service'
import { environment } from 'src/environments/environment'
import footerMenuData from '../../../assets/json/menu-footer.json'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  eventCount: any
  sightCount: any

  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`

  isAuth: boolean = false
  menu!: FooterMenu[]
  avatarUrl!: string
  user!: any
  mobile: boolean = true
  currentRout = this.router
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private mobileOrNoteService: MobileOrNoteService,
  ) {}

  @HostListener('window:resize', ['$event'])
  mobileOrNote(_event?: Event) {
    this.mobileOrNoteService.update()
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
    this.mobileOrNoteService.isMobileLayout.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.mobile = value
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
