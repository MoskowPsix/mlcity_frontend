import { Component } from '@angular/core';
import { FilterService } from './services/filter.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private filterService: FilterService) {
    //сбрасываем фильтры даты при каждом запуске прилолжения
    //this.filterService.removeDateFilters()

    //Сбрасываем фильтры, если у юзера было установлено не сохранять фильтры
    // if (this.filterService.saveFilters.value === 0)
    //   this.filterService.removeFilters()
  }


}

