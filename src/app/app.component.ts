import { FilterService } from './services/filter.service'
import { Component, HostListener, NgZone, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import { environment } from 'src/environments/environment'
import { ToastService } from './services/toast.service'
import { Subject, takeUntil } from 'rxjs'
import { CheckVersionService } from './services/check-version.service'
import { Capacitor } from '@capacitor/core'
import { StoreInfo } from './models/store-info'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

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
  ) {
    this.initializeApp()
  }
  url: any = ''
  mobile: boolean = false
  iframeUrl: any
  platformType: string = Capacitor.getPlatform()

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
          this.router.navigateByUrl(String(appPath))
        }
      })
    })
  }

  async ngOnInit() {
    this.mobileOrNote()
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.url = this.router.url
      if (this.url.includes('/cabinet/sights/edit')) {
        this.url = '/cabinet/sights/edit'
      }
      if (this.url.includes('/cabinet/events/edit')) {
        this.url = '/cabinet/events/edit'
      }
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.BASE_URL}${this.url}`)
    })

    // this.checkVersionService.getCurrentVersion().then((res: string) => {
    //   this.toast.showToast(res, 'primary')
    // })
  }
}
