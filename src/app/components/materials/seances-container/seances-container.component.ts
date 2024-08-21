import { Component, Input, OnInit } from '@angular/core'
import { ISeance } from 'src/app/models/seance'
import { SearchFirstySeanceService } from 'src/app/services/search-firsty-seance.service'
import moment from 'moment'
@Component({
  selector: 'app-seances-container',
  templateUrl: './seances-container.component.html',
  styleUrls: ['./seances-container.component.scss'],
})
export class SeancesContainerComponent implements OnInit {
  constructor() {}
  @Input() seances!: any[]
  @Input() priceState!: string
  templateDate: any
  calendarFilter: any
  viewSeances!: any[]
  minSeance: any
  searchMinSeance() {
    const today = moment()
    let minSeanceTime = Infinity
    let minSeance: any
    this.seances.forEach((seance) => {
      const seanceStart = moment(seance.date_start)
      const difference = seanceStart.diff(today)
      if (difference < minSeanceTime && seanceStart > today) {
        minSeanceTime = difference
        minSeance = seance
      }
    })
    return minSeance
  }
  setDateMinSeance(seance: any) {
    this.calendarFilter = {
      dateStart: moment(seance.split(' ')[0]),
      dateEnd: moment(seance.split(' ')[0]),
    }
    this.templateDate = {
      dateStart: moment(seance.split(' ')[0]),
      dateEnd: moment(seance.split(' ')[0]),
    }
    this.seances.forEach((seance: any) => {
      this.checkSeances(seance)
    })
  }
  setDateFilter(event: any) {
    this.templateDate = event
    this.viewSeances = []
    this.calendarFilter = event
    this.seances.forEach((seance: any) => {
      this.checkSeances(seance)
    })
    if (this.viewSeances.length == 0) {
      let minSeance = this.searchMinSeance()
      this.calendarFilter = {
        dateStart: moment(minSeance.date_start.split(' ')[0]),
        dateEnd: moment(minSeance.date_end.split(' ')[0]),
      }
      this.minSeance = minSeance.date_start
    }
  }
  setStartDate(event: any) {
    this.calendarFilter = event
    this.viewSeances = []
    this.seances.forEach((seance: any) => {
      this.checkSeances(seance)
    })
    if (this.viewSeances.length == 0) {
      let minSeance = this.searchMinSeance()
      this.calendarFilter = {
        dateStart: moment(minSeance.date_start.split(' ')[0]),
        dateEnd: moment(minSeance.date_end.split(' ')[0]),
      }
      this.minSeance = minSeance.date_start
    }
  }
  checkSeances(seance: ISeance) {
    let dateStart = moment(seance.date_start.split(' ')[0])
    let dateEnd = moment(seance.date_end.split(' ')[0])
    if (dateStart >= moment(this.calendarFilter.dateStart) && dateEnd <= moment(this.calendarFilter.dateEnd)) {
      this.viewSeances.push(seance)
    }
  }
  ngOnInit() {}
}
