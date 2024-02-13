import { FilterService } from './services/filter.service';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private zone: NgZone,
    private toast: ToastService,
    ) {
      this.initializeApp();
  }

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => { 
      if (!event.url.includes(':'+environment.BACKEND_PORT)) {
        this.zone.run(() => {
            const domain = environment.DOMAIN
            const pathArray = event.url.split(domain)
            const appPath = pathArray.pop()
            if (appPath) {
              this.router.navigateByUrl(String(appPath))
            }
          });
      }
    });
  }


}

