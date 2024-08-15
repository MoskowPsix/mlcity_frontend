import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core'
import { debounceTime } from 'rxjs/operators'
import { FormControl, FormGroup } from '@angular/forms'
import { NativeDateAdapter, MatDateFormats, MAT_DATE_LOCALE } from '@angular/material/core'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core'
import { FilterService } from 'src/app/services/filter.service'
import moment from 'moment'
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs'
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
  @Output() setDateEmit: EventEmitter<any> = new EventEmitter()
  @Input() storageDate = {}
  openModal: boolean = true
  dateStart: any
  dateEnd: any
  filterService: FilterService = inject(FilterService)
  private readonly destroy$ = new Subject<void>()
  constructor() {}

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  })

  openDatepicker() {
    this.openModal = !this.openModal
  }
  render() {
    this.dateStart = this.filterService.startDate.value
    this.dateEnd = this.filterService.endDate.value
  }

  ionViewDidLeave() {
    this.destroy$.next()
    this.destroy$.complete()
  }
  ngOnInit() {
    // if (this.filterService.getStartDateFromlocalStorage() && this.filterService.getEndDateFromlocalStorage()) {
    //   this.dateStart = moment(this.filterService.getStartDateFromlocalStorage()).format('MM/DD/YYYY')
    //   this.dateEnd = moment(this.filterService.getEndDateFromlocalStorage()).format('MM/DD/YYYY')
    //   this.dateRange.patchValue({
    //     start: moment(this.filterService.getStartDateFromlocalStorage()).toDate(),
    //     end: moment(this.filterService.getEndDateFromlocalStorage()).toDate(),
    //   })
    // }
    this.filterService.changeFilter.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.render()
    })
    this.dateRange.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe((values: any) => {
      this.setDateEmit.emit({
        dateStart: moment(values.start).format('MM-DD-YYYY'),
        dateEnd:
          moment(values.end).format('MM-DD-YYYY') !== 'Invalid date'
            ? moment(values.end).format('MM-DD-YYYY')
            : moment(values.start).format('MM-DD-YYYY'),
      })
    })
  }
}
