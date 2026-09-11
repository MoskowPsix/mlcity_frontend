import { Component, Input, OnInit } from '@angular/core'
import { ISeance } from 'src/app/models/seance'
import moment, { Moment } from 'moment'
@Component({
  selector: 'app-seances-container',
  templateUrl: './seances-container.component.html',
  styleUrls: ['./seances-container.component.scss'],
})
export class SeancesContainerComponent implements OnInit {
  constructor() {}
  @Input() seances!: any[]
  @Input() priceState!: string
  @Input() buyLink!: string
  templateDate: any
  calendarFilter: any
  viewSeances!: any[]
  minSeance: any

  private toDay(date: any): Moment {
    if (!date) {
      return moment().startOf('day')
    }
    const raw = typeof date === 'string' ? date.split(' ')[0] : date
    return moment(raw).startOf('day')
  }

  private seanceOverlapsFilter(seance: ISeance): boolean {
    if (!this.calendarFilter) {
      return false
    }
    const dateStart = this.toDay(seance.date_start)
    const dateEnd = this.toDay(seance.date_end || seance.date_start)
    const filterStart = this.toDay(this.calendarFilter.dateStart)
    const filterEnd = this.toDay(this.calendarFilter.dateEnd)
    // Сеанс попадает в выбранный период, если интервалы пересекаются
    return dateStart.valueOf() <= filterEnd.valueOf() && dateEnd.valueOf() >= filterStart.valueOf()
  }

  searchMinSeance() {
    const today = moment()
    let minSeanceTime = Infinity
    let minSeance: any
    ;(this.seances || []).forEach((seance) => {
      const seanceStart = moment(seance.date_start)
      const difference = seanceStart.diff(today)
      if (difference < minSeanceTime && seanceStart > today) {
        minSeanceTime = difference
        minSeance = seance
      }
    })
    return minSeance
  }

  async setDateMinSeance(seance: any) {
    const day = this.toDay(seance)
    this.calendarFilter = {
      dateStart: day,
      dateEnd: day,
    }
    this.templateDate = {
      dateStart: day,
      dateEnd: day,
    }
    await this.render()
  }

  render() {
    this.viewSeances = (this.seances || []).filter((seance) => this.seanceOverlapsFilter(seance))
  }

  setDateFilter(event: any) {
    this.templateDate = event
    this.viewSeances = []
    this.calendarFilter = event
    this.render()
    if (this.viewSeances.length == 0) {
      let minSeance = this.searchMinSeance()
      if (minSeance) {
        this.calendarFilter = {
          dateStart: this.toDay(minSeance.date_start),
          dateEnd: this.toDay(minSeance.date_end || minSeance.date_start),
        }
        this.minSeance = minSeance.date_start
      }
    }
  }

  setStartDate(event: any) {
    this.calendarFilter = event
    this.viewSeances = []
    this.render()
    if (this.viewSeances.length == 0) {
      let minSeance = this.searchMinSeance()
      if (minSeance) {
        this.calendarFilter = {
          dateStart: this.toDay(minSeance.date_start),
          dateEnd: this.toDay(minSeance.date_end || minSeance.date_start),
        }
        this.minSeance = minSeance.date_start
      }
    }
  }

  ngOnInit() {}
}
