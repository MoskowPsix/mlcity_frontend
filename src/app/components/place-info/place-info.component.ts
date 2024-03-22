import { Component, Input, OnInit } from '@angular/core';
import { YaReadyEvent } from 'angular8-yandex-maps';
import {
  EMPTY,
  Subject,
  catchError,
  delay,
  map,
  of,
  retry,
  takeUntil,
  tap,
} from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IPlace } from 'src/app/models/place';
import { PlaceService } from 'src/app/services/place.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-place-info',
  templateUrl: './place-info.component.html',
  styleUrls: ['./place-info.component.scss'],
})
export class PlaceInfoComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  @Input() place!: IPlace;
  place_date!: any[];
  date: any = {
    dateStart: new Date()
      .toLocaleDateString('pt-br')
      .split('/')
      .reverse()
      .join('-'),
    dateEnd: new Date()
      .toLocaleDateString('pt-br')
      .split('/')
      .reverse()
      .join('-'),
  };
  @Input() load_seances!: boolean;

  loadMap: boolean = true;
  loadSeance!: boolean;
  map!: YaReadyEvent<ymaps.Map>;

  constructor(
    private placeService: PlaceService,
    private toastSerivce: ToastService
  ) {}

  getUnixTime(time: string) {
    return new Date(time)
      .toLocaleDateString('pt-br')
      .split('/')
      .reverse()
      .join('-');
  }

  getSeanses() {
    this.loadSeance = true;
    this.placeService
      .getSeanses(this.place.id)
      .pipe(
        delay(500),
        retry(3),
        tap(() => {}),
        map(response => {
          this.place_date = response.seances;
          this.normalizeDate();
        }),
        catchError(error => {
          this.toastSerivce.showToast(MessagesErrors.default, 'danger');
          return of(EMPTY);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onMapReady({ target, ymaps }: YaReadyEvent<ymaps.Map>) {
    //Создаем метку
    this.map = { target, ymaps };
    target.geoObjects.add(
      new ymaps.Placemark(
        [this.place?.latitude, this.place?.longitude],
        {},
        {
          iconLayout: 'default#imageWithContent',
          iconContentLayout: ymaps.templateLayoutFactory.createClass(
            `'<div class="marker"></div>'`
          ),
        }
      )
    );
    this.map.target.controls.remove('zoomControl');
    this.map.target.behaviors.disable('drag');
    this.loadMap = false;
  }

  // определение какой это день в неделе
  dayWeek(date: any) {
    return new Date(date).getDay();
  }

  changeDateRange(event: any) {
    this.date.dateStart = event.dateStart;
    this.date.dateEnd = event.dateEnd;
  }
  //Отбрасываем дату которая меньше нашей
  normalizeDate() {
    this.loadSeance = false;
    if (this.place_date.length > 1) {
      let test = this.place_date.filter((d: any) => {
        if (new Date(d.date_start).getTime() >= new Date().getTime()) {
          return d;
        }
      });
      this.changeDateRange({
        dateStart: new Date()
          .toLocaleDateString('pt-br')
          .split('/')
          .reverse()
          .join('-'),
        dateEnd: new Date(test[0].date_start)
          .toLocaleDateString('pt-br')
          .split('/')
          .reverse()
          .join('-'),
      });
    } else {
      this.changeDateRange({
        dateStart: new Date()
          .toLocaleDateString('pt-br')
          .split('/')
          .reverse()
          .join('-'),
        dateEnd: new Date()
          .toLocaleDateString('pt-br')
          .split('/')
          .reverse()
          .join('-'),
      });
    }
  }

  ngOnInit() {
    if (this.load_seances) {
      this.getSeanses();
    }
    // console.log(this.place_date)
    // console.log(1<=5 && 5<=10)
  }
}
