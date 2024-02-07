import { FilterService } from './services/filter.service';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    // private filterService: FilterService,
    // private deeplinks: Deeplinks,
    private router: Router,
    private zone: NgZone
    ) {
      // this.initializeApp();
    //сбрасываем фильтры даты при каждом запуске прилолжения
    //this.filterService.removeDateFilters()

    //Сбрасываем фильтры, если у юзера было установлено не сохранять фильтры
    // if (this.filterService.saveFilters.value === 0)
    //   this.filterService.removeFilters()
  }

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      console.log(event)
        this.zone.run(() => {
            // Example url: https://beerswift.app/tabs/tab2
            // slug = /tabs/tab2
            const slug = event.url.split(".ru").pop();
            if (slug) {
                this.router.navigateByUrl(slug);
            }
            // If no match, do nothing - let regular routing
            // logic take over
        });
    });
  }


}

