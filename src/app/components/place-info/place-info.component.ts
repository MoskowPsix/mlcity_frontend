import { Component, Input, OnInit } from '@angular/core';
import { YaReadyEvent } from 'angular8-yandex-maps';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IPlace } from 'src/app/models/place';
import { PlaceService } from 'src/app/services/place.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-place-info',
  templateUrl: './place-info.component.html',
  styleUrls: ['./place-info.component.scss'],
})
export class PlaceInfoComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()

  @Input() place!: IPlace
  place_date: any
  date: any = {dateStart: new Date().toISOString(), dateEnd: new Date().toISOString()}
  @Input() load_seances!: boolean

  loadMap: boolean = true
  loadSeance!: boolean


  constructor(
    private placeService: PlaceService,
    private toastSerivce: ToastService
  ) {}

  
  getUnixTime(time: string) {
    return Math.ceil(new Date(time).getTime() / 86400000)
  }

  getSeanses(){
    this.loadSeance = true
    this.placeService.getSeanses(this.place.id).pipe(
      delay(500),
      retry(3),
      tap(()=> {this.loadSeance = false}),
      map((response)=>{
        this.place_date = response.seances
      }),
      catchError((error) => {
        this.toastSerivce.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY)
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  onMapReady({target, ymaps}: YaReadyEvent<ymaps.Map>) {
    //Создаем метку 
    target.geoObjects.add(
      new ymaps.Placemark([this.place?.latitude, this.place?.longitude],{}, {
        iconLayout: 'default#imageWithContent',
        iconContentLayout: ymaps.templateLayoutFactory.createClass(`'<div class="marker"></div>'`)
      })
    )
    this.loadMap = false
  }

  // определение какой это день в неделе
  dayWeek(date: any){
    
    return new Date(date).getDay()
  }

  changeDateRange(event: any){
    this.date.dateStart = event.dateStart
    this.date.dateEnd = event.dateEnd

  }
  //Отбрасываем дату которая меньше нашей
  normalizeDate(){
    let cur_date: Date = new Date();

    if (this.place_date.length > 1) {
    let test = this.place_date.filter((d: any) => {
      new Date(d.dateStart).getTime()>=cur_date.getTime()
    })
    this.changeDateRange({dateStart: new Date(test[0].dateStart).toISOString(), dateEnd: new Date(test[0].dateStart).toISOString()})
  } else {
    this.changeDateRange({dateStart: new Date(this.place_date[0].dateStart).toISOString(), dateEnd: new Date(this.place_date[0].dateStart).toISOString()})
  }
    // this.date.dateStart = new Date(test[0].dateStart)
    // this.date.dateEnd = new Date(test[0].dateEnd)
    // console.log(test)

  }
  
  ngOnInit() {
    if(this.load_seances){
      this.getSeanses()
    this.normalizeDate()
    }
    
    
    // console.log(this.place_date)
    // console.log(1<=5 && 5<=10)
  }

}
