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
import moment from 'moment'
import 'moment/locale/ru'
import { NotifyService } from './services/notify.service'
moment.locale('ru')
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(
    private notifyService: NotifyService,
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
  messages: any[] = []
  url: any = ''
  mobile: boolean = false
  iframeUrl: any
  platformType: string = Capacitor.getPlatform()
  aboutModal: boolean = false
  swiperIndex: number = 1
  @ViewChild('swiper') swiper!: any

  swiperItemsArray: any[] = [
    {
      image: '/assets/images/Ресурс 17.png',
      header: 'Смотри что происходит ВОКРУГ тебя!',
      description: 'Используй карту! Быстро находи что происходит здесь и сейчас!',
      background: 'linear-gradient(180deg, rgba(255,192,0,1) 0%, rgba(255,101,0,1) 100%);',
      backgroundColor: 'rgb(255,192,0);',
    },
    {
      image: '/assets/images/Ресурс 18.png',
      header: 'Узнай кто придет вместе с тобой!',
      description: 'Используй карту! Быстро находи что происходит здесь и сейчас!',
      background: 'linear-gradient(180deg, rgba(140,198,63,1) 0%, rgba(0,146,69,1) 100%)',
    },
    {
      image: '/assets/images/Ресурс 19.png',
      header: 'Создай свое событие!',
      description: 'ВОКРУГ тишина? Заяви о себе!',
      background: 'linear-gradient(180deg, rgba(193,39,143,1) 0%, rgba(102,45,145,1) 100%);',
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
    this.notifyService.initSSE()
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
