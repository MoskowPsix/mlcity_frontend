import { FilterService } from './services/filter.service'
import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import { environment } from 'src/environments/environment'
import { ToastService } from './services/toast.service'
import { Subject, takeUntil } from 'rxjs'
import { CheckVersionService } from './services/check-version.service'
import { Capacitor } from '@capacitor/core'
import { StoreInfo } from './models/store-info'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { UserService } from './services/user.service'
import { AuthService } from './services/auth.service'
import { TokenService } from './services/token.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(
    private router: Router,
    private zone: NgZone,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private checkVersionService: CheckVersionService,
    private userService: UserService,
    private authService: AuthService,
    private tokenService: TokenService,
    private filterService: FilterService,
  ) {
    ScreenOrientation.lock({ orientation: 'portrait' })
    this.initializeApp()
  }
  url: any = ''
  mobile: boolean = false
  iframeUrl: any
  platformType: string = Capacitor.getPlatform()
  aboutModal: boolean = false
  swiperIndex: number = 1
  @ViewChild('swiper') swiper!: any

  swiperItemsArray: any[] = [
    {
      image: '/assets/images/sliderImag1.jpg',
      header: 'Смотри что происходит ВОКРУГ тебя!',
      description: 'Используй карту! Быстро находи что происходит здесь и сейчас!',
      background: 'linear-gradient(180deg, rgba(157,124,228,1) 0%, rgba(65,41,115,1) 100%);',
    },
    {
      image: '/assets/images/sliderImag2.jpg',
      header: 'Узнай кто придет вместе с тобой!',
      description: 'Используй карту! Быстро находи что происходит здесь и сейчас!',
      background: 'linear-gradient(180deg, rgba(78,230,103,1) 0%, rgba(12,112,28,1) 100%);',
    },
    {
      image: '/assets/images/sliderImag3.jpg',
      header: 'Создай свое событие!',
      description: 'ВОКРУГ тишина? Заяви о себе!',
      background: 'linear-gradient(180deg, rgba(32,101,224,1) 0%, rgba(28,57,109,1) 100%);',
    },
  ]
  closeAboutModal() {
    this.aboutModal = false
    this.filterService.setAboutMobileStateFromLocalStorage(true)
  }

  aboutModalslideChange(event: any) {
    this.swiperIndex = event.detail[0].activeIndex + 1
  }
  aboutModalNextslide() {
    this.swiper.nativeElement.swiper.slideNext()
  }

  @HostListener('window:resize', ['$event'])
  mobileOrNote() {
    if (window.innerWidth < 1200) {
      this.mobile = true
    } else if (window.innerWidth > 1200) {
      this.mobile = false
    } else {
      this.mobile = false
    }
  }

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        const domain = environment.DOMAIN
        const pathArray = event.url.split(domain)
        const appPath = pathArray.pop()
        if (appPath) {
          // this.toast.showToast(appPath, 'error')
          this.router.navigateByUrl(String(new URL(appPath).pathname))
        }
      })
    })
  }

  async ngOnInit() {
    this.mobileOrNote()
    if (this.filterService.getAboutMobileStateFromLocalStorage()) {
      this.aboutModal = false
    } else {
      this.aboutModal = true
    }

    this.filterService.setEventTypesTolocalStorage([])
    this.filterService.setSightTypesTolocalStorage([])
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.url = this.router.url
      if (this.url.includes('/cabinet/sights/edit')) {
        this.url = '/cabinet/sights/edit'
      }
      if (this.url.includes('/cabinet/events/edit')) {
        this.url = '/cabinet/events/edit'
      }
      if (this.url.includes('/events/') && /\d/.test(this.url)) {
        this.url = '/events/number'
      }
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.BASE_URL}${this.url}`)
    })

    // this.checkVersionService.getCurrentVersion().then((res: string) => {
    //   this.toast.showToast(res, 'primary')
    // })
  }
}
