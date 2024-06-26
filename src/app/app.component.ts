import { FilterService } from './services/filter.service'
import { Component, HostListener, NgZone, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import { environment } from 'src/environments/environment'
import { ToastService } from './services/toast.service'
import { Subject, takeUntil } from 'rxjs'
import { Capacitor } from '@capacitor/core'

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
    private toast: ToastService,
  ) {
    this.initializeApp()
  }
  url: any = ''
  mobile: boolean = false
  platformType: string = Capacitor.getPlatform()
  
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

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (!event.url.includes(':' + environment.BACKEND_PORT)) {
        this.zone.run(() => {
          const domain = environment.DOMAIN
          const pathArray = event.url.split(domain)
          const appPath = pathArray.pop()
          if (appPath) {
            this.router.navigateByUrl(String(appPath))
          }
        })
      }
    })
  }

  ngOnInit(): void {
    this.mobileOrNote()
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.url = this.router.url
    })
  }
}
