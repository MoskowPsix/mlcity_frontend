import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-calendula',
  templateUrl: './calendula.component.html',
  styleUrls: ['./calendula.component.scss'],
})
export class CalendulaComponent  implements OnInit {

  constructor() { }
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
    {name: 'Декабрь', data: []}
  ]
  dateStart: any
  dateEnd: any

  scrollLeft(){
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 300), behavior: 'smooth' });
  }
  scrollRight(){
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 300), behavior: 'smooth' });
  }

  setDate(date: any) {
    if (!this.dateStart) {
      this.dateStart = date 
      console.log(this.dateStart, this.dateEnd)
    }else if(new Date(date).getTime <= new Date(this.dateStart).getTime) {
      this.dateStart = date
      console.log(this.dateStart, this.dateEnd)
    } else if (!this.dateEnd){
      this.dateEnd = date
      console.log(this.dateStart, this.dateEnd)
    } else {
      this.dateStart = date
      this.dateEnd = false
      console.log(this.dateStart, this.dateEnd)
    }
  }

  ngOnInit() {
    let now_date: any = new Date().getTime()
    let data: any
    let count: number
    for (count = 0; count <= 90; count++) {
      let now_month: any = new Date(now_date).getMonth()
      switch (now_month) {
        case 0:
          this.date_full[0].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('1');
          break;
        case 1:
          this.date_full[1].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('2');
          break;
        case 2:
          this.date_full[2].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('3');
          break;
        case 3:
          this.date_full[3].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('4');
          break;
        case 4:
          this.date_full[4].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('5');
          break;
        case 5:
          this.date_full[5].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('6');
          break;
        case 6:
          this.date_full[6].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('7');
          break;
        case 7:
          //console.log('8');
          this.date_full[7].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          break;
        case 8:
          this.date_full[8].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('9');
          break;
        case 9:
          this.date_full[9].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('10');
          break;
        case 10:
          this.date_full[10].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('11');
          break;
        case 11:
          this.date_full[11].data.push({number: new Date(now_date).getDate(), day_week: new Date(now_date).getDay(), full_date: new Date(now_date).toString()})
          //console.log('12');
          break;
      }
      now_date = now_date + 86400000
    }
    console.log(this.date_full)
  }

}



