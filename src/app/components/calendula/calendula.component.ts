import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-calendula',
  templateUrl: './calendula.component.html',
  styleUrls: ['./calendula.component.scss'],
})
export class CalendulaComponent  implements OnInit {
  constructor(  ) { }
  @Input() scroll: number = 500
  @Output() dateOutput = new EventEmitter();
  @Output() date: any = {dateStart: this.getDateYMD(new Date().getTime()), dateEnd: this.getDateYMD(new Date().getTime())}
  @ViewChild('widgetsContent') widgetsContent!: ElementRef;

  date_full_year:any = 
    {now_year: {now_months: [
      {name: 'Янв', data: []}, 
      {name: 'Фев', data: []}, 
      {name: 'Март', data: []}, 
      {name: 'Апр', data: []}, 
      {name: 'Май', data: []}, 
      {name: 'Июнь', data: []}, 
      {name: 'Июль', data: []}, 
      {name: 'Авг', data: []}, 
      {name: 'Сент', data: []},  
      {name: 'Окт', data: []}, 
      {name: 'Нояб', data: []}, 
      {name: 'Дек', data: []},
    ], year: new Date(this.getDateYMD(new Date().getTime())).getFullYear()},
    new_year: {new_months: [
      {name: 'Янв', data: []}, 
      {name: 'Фев', data: []}, 
      {name: 'Март', data: []}, 
      {name: 'Апр', data: []}, 
      {name: 'Май', data: []}, 
      {name: 'Июнь', data: []}, 
      {name: 'Июль', data: []}, 
      {name: 'Авг', data: []}, 
      {name: 'Сент', data: []},  
      {name: 'Окт', data: []}, 
      {name: 'Нояб', data: []}, 
      {name: 'Дек', data: []},
    ], year: new Date(this.getDateYMD(new Date().getTime())).getFullYear() + 1}}

   dateStart: number = 0
   dateEnd: number = 0

     
  choosedDate(event: any) {
    console.log(event)
  }

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
    // }else if(date <= this.dateStart) {

    //   this.dateStart = date
    //   this.dateEnd = date

    //   this.date.dateStart = new Date(date).toISOString()
    //   this.date.dateEnd = new Date(date).toISOString()
    } else if (this.dateEnd === this.dateStart){

      if (date < this.dateStart) {
        this.dateEnd = this.dateStart
        this.dateStart = date
        this.date.dateStart = new Date(date).toISOString()
        this.date.dateEnd = new Date(this.dateEnd).toISOString()
      } else if(date > this.dateStart) {
        this.dateEnd = date
        this.date.dateEnd = new Date(date).toISOString()
      }
    } else {
      this.dateStart = date
      this.dateEnd = date

      this.date.dateStart = new Date(date).toISOString()
      this.date.dateEnd = new Date(date).toISOString()

    }
    console.log(this.date)
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
    // Подгрузить дату из стора(как понял)
    this.dateStart  = new Date(this.date.dateStart).getTime()
    this.dateEnd = Math.ceil(new Date(this.date.dateEnd).getTime()) 

    let now_date: any =  new Date(this.getDateYMD(new Date().getTime())).getTime()
    let count: number
    for (count = 0; count <= 150; count++) {
      let now_year: any = new Date(now_date).getFullYear()
      let now_month: any = new Date(now_date).getMonth()
      if(this.date_full_year.now_year.year === new Date(now_date).getFullYear()) {
        switch (now_month) {
          case 0:
            this.date_full_year.now_year.now_months[0].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('1');
            break;
          case 1:
            this.date_full_year.now_year.now_months[1].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('2');
            break;
          case 2:
            this.date_full_year.now_year.now_months[2].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('3');
            break;
          case 3:
            this.date_full_year.now_year.now_months[3].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('4');
            break;
          case 4:
            this.date_full_year.now_year.now_months[4].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('5');
            break;
          case 5:
            this.date_full_year.now_year.now_months[5].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('6');
            break;
          case 6:
            this.date_full_year.now_year.now_months[6].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('7');
            break;
          case 7:
            //console.log('8');
            this.date_full_year.now_year.now_months[7].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            break;
          case 8:
            this.date_full_year.now_year.now_months[8].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('9');
            break;
          case 9:
            this.date_full_year.now_year.now_months[9].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('10');
            break;
          case 10:
            this.date_full_year.now_year.now_months[10].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('11');
            break;
          case 11:
            this.date_full_year.now_year.now_months[11].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
            //console.log('12');
            break;
          }

        } else if (this.date_full_year.new_year.year === new Date(now_date).getFullYear()) {
          switch (now_month ) {
            case 0:
              this.date_full_year.new_year.new_months[0].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('1');
              break;
            case 1:
              this.date_full_year.new_year.new_months[1].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('2');
              break;
            case 2:
              this.date_full_year.new_year.new_months[2].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('3');
              break;
            case 3:
              this.date_full_year.new_year.new_months[3].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('4');
              break;
            case 4:
              this.date_full_year.new_year.new_months[4].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('5');
              break;
            case 5:
              this.date_full_year.new_year.new_months[5].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('6');
              break;
            case 6:
              this.date_full_year.new_year.new_months[6].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('7');
              break;
            case 7:
              //console.log('8');
              this.date_full_year.new_year.new_months[7].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              break;
            case 8:
              this.date_full_year.new_year.new_months[8].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('9');
              break;
            case 9:
              this.date_full_year.new_year.new_months[9].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('10');
              break;
            case 10:
              this.date_full_year.new_year.new_months[10].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
              //console.log('11');
              break;
            case 11:
              this.date_full_year.new_year.new_months[11].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString(), min: Math.ceil(now_date)})
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



