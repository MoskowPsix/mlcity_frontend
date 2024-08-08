import { Component, Input, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { NativeDateAdapter, MatDateFormats, MAT_DATE_LOCALE } from '@angular/material/core'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core'

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}
@Component({
  selector: 'app-calendar-button',
  templateUrl: './calendar-button.component.html',
  styleUrls: ['./calendar-button.component.scss'],
  // providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_NATIVE_DATE_FORMATS }],
})
export class CalendarButtonComponent implements OnInit {
  @Input() outlineIcon: boolean = false
  openModal: boolean = true
  constructor() {}

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  })
  openDatepicker() {
    this.openModal = !this.openModal
  }

  ngOnInit() {}
}
