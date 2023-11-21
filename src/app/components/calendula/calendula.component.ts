import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, Renderer2 } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-calendula',
  templateUrl: './calendula.component.html',
  styleUrls: ['./calendula.component.scss'],
})
export class CalendulaComponent  implements OnInit {
  constructor( private filterService: FilterService, private renderer: Renderer2 ) { }
  @Input() scroll!: number 
  @Output() dateOutput = new EventEmitter();
  @Input() date: any = {dateStart: Date().toLocaleString, dateEnd: Date().toLocaleString,}
  @ViewChild('widgetsContent') widgetsContent!: ElementRef;
  date_full: any = [
    {name: 'Январь', data: []}, 
    {name: 'Февраль', data: []}, 
    {name: 'Март', data: []}, 
    {name: 'Апрель', data: []}, 
    {name: 'Май', data: []}, 
    {name: 'Июнь', data: []}, 
    {name: 'Июль', data: []}, 
    {name: 'Август', data: []}, 
    {name: 'Сентябрь', data: []},  
    {name: 'Октябрь', data: []}, 
    {name: 'Ноябрь', data: []}, 
    {name: 'Декабрь', data: []},
    {name: 'Январь 2024', data: []}
  ]

  date_full_year:any = 
    {now_year: {months: this.date_full,year: new Date(this.getDateYMD(new Date().getTime())).getFullYear()},
    new_year: {months: this.date_full, year: new Date(this.getDateYMD(new Date().getTime())).getFullYear() + 1}}

   dateStart: number = 0
   dateEnd: number = 0

  getDateYMD(data: number) {
    let year = new Date(data).getFullYear()
    let month = new Date(data).getMonth()
    let day = new Date(data).getDate()
    // console.log(new Date(year, month, day).toISOString())
    return new Date(year, month, day).toISOString()
  }
  onDateOutput() {
    this.dateOutput.emit(this.date)
  }
  scrollLeft(){
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - this.scroll), behavior: 'smooth' });
  }
  scrollRight(){
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + this.scroll), behavior: 'smooth' });
  }

  setDate(date: any) {
    if (!this.dateStart) {

      this.dateStart = date
      this.dateEnd = date

      this.date.dateStart = new Date(date).toISOString()
      this.date.dateEnd = new Date(date).toISOString()
      // this.filterService.setStartDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.setEndDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.changeFilter.next(true)   
    }else if(date <= this.dateStart) {

      this.dateStart = date
      this.dateEnd = date

      this.date.dateStart = new Date(date).toISOString()
      this.date.dateEnd = new Date(date).toISOString()
      // this.filterService.setStartDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.setEndDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.changeFilter.next(true) 
    } else if (this.dateEnd === this.dateStart){
      this.dateEnd = date
      this.date.dateEnd = new Date(date).toISOString()
      // this.filterService.setEndDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.changeFilter.next(true) 
    } else {

      this.dateStart = date
      this.dateEnd = date

      this.date.dateStart = new Date(date).toISOString()
      this.date.dateEnd = new Date(date).toISOString()
      // this.filterService.setStartDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.setEndDateTolocalStorage(new Date(date*100000).toISOString())
      // this.filterService.changeFilter.next(true) 
    }
    this.fixCenterElement(date)
    this.onDateOutput()
  }

  fixCenterElement(date: any) {
    var elem = this.widgetsContent.nativeElement!.offsetWidth
    let left = document.getElementById(date)!.offsetLeft
    let right = elem - document.getElementById(date)!.offsetLeft

    if (left > right) {
      this.widgetsContent.nativeElement.scrollTo({left: left - elem/2, behavior: 'smooth'})
    } else if (right > left) {
      this.widgetsContent.nativeElement.scrollTo({right:right - elem/2, behavior: 'smooth'})
    }
  }

  ngOnInit() {
    
    if(!this.scroll) {
      this.scroll = 500
    } 

    const full_year: any = {now_year: {months: [],year: new Date(this.getDateYMD(new Date().getTime())).getFullYear()},
                            new_year: {months: [], year: new Date(this.getDateYMD(new Date().getTime())).getFullYear() + 1}}


    // Подгрузить дату из стора(как понял)
    this.dateStart  = new Date(this.date.dateStart).getTime()
    this.dateEnd = Math.ceil(new Date(this.date.dateEnd).getTime()) 

    let now_date: any =  new Date(this.getDateYMD(new Date().getTime())).getTime()
    let data: any
    let count: number
    for (count = 0; count <= 365; count++) {
      let now_month: any = new Date(now_date).getMonth()
      let now_year: any = new Date(now_date).getFullYear()
      if(this.date_full_year.now_year.year == now_year) {
        switch (now_month) {
          case 0:
            this.date_full_year.now_year.mounth[0].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('1');
            break;
          case 1:
            this.date_full_year.now_year.mounth[1].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('2');
            break;
          case 2:
            this.date_full_year.now_year.mounth[2].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('3');
            break;
          case 3:
            this.date_full_year.now_year.mounth[3].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('4');
            break;
          case 4:
            this.date_full_year.now_year.mounth[4].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('5');
            break;
          case 5:
            this.date_full_year.now_year.mounth[5].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('6');
            break;
          case 6:
             this.date_full_year.now_year.mounth[6].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('7');
            break;
          case 7:
            //console.log('8');
             this.date_full_year.now_year.mounth[7].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            break;
          case 8:
            this.date_full_year.now_year.mounth[8].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('9');
            break;
          case 9:
            this.date_full_year.now_year.mounth[9].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('10');
            break;
          case 10:
            this.date_full_year.now_year.mounth[10].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('11');
            break;
          case 11:
            this.date_full_year.now_year.mounth[11].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('12');
            break;
          }
        } else if(this.date_full_year.new_year.year == now_year) {
          
          switch (now_month) {
            case 0:
              this.date_full_year.new_year.mounth[0].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('1');
              break;
            case 1:
              this.date_full_year.new_year.mounth[1].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('2');
              break;
            case 2:
              this.date_full_year.new_year.mounth[2].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('3');
              break;
            case 3:
              this.date_full_year.new_year.mounth[3].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('4');
              break;
            case 4:
              this.date_full_year.new_year.mounth[4].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('5');
              break;
            case 5:
              this.date_full_year.new_year.mounth[5].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('6');
              break;
            case 6:
              this.date_full_year.new_year.mounth[6].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('7');
              break;
            case 7:
              //console.log('8');
              this.date_full_year.new_year.mounth[7].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              break;
            case 8:
              this.date_full_year.new_year.mounth[8].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('9');
              break;
            case 9:
              this.date_full_year.new_year.mounth[9].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('10');
              break;
            case 10:
              this.date_full_year.new_year.mounth[10].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('11');
              break;
            case 11:
              this.date_full_year.new_year.mounth[11].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('12');
              break;
            }
        }
      now_date = now_date + 86400000
      //this.onDateOutput()
      
    }
    console.log(this.date_full_year)
    setTimeout(() => {this.fixCenterElement(new Date(this.getDateYMD(this.dateStart)).getTime())}, 3000);
  }


}



