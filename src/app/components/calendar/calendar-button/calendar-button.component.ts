import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
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
  @Input() openCalendar: boolean = false
  @Output() setDateEmit: EventEmitter<any> = new EventEmitter()
  @Output() startDateEmit: EventEmitter<any> = new EventEmitter()
  @Output() calendarElement: EventEmitter<any> = new EventEmitter()
  @Output() closeCalendar: EventEmitter<any> = new EventEmitter()
  @ViewChild('picker') picker!: ElementRef
  @Input() storageDate = {}
  @Input() theme: string = ''
  @Input() templateDate: any
  openModal: boolean = true
  dateStart: any
  dateEnd: any
  filterService: FilterService = inject(FilterService)
  private readonly destroy$ = new Subject<void>()
  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.getFirstDayOfWeek = () => 1
  }

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  })
  ngOnChanges(changes: SimpleChanges) {
    if (changes['templateDate']) {
      this.dateRange.value.start = moment(changes['templateDate'].currentValue.dateStart).toDate()
      this.dateRange.value.end = moment(changes['templateDate'].currentValue.dateStart).toDate()
      //Дата повторяется для того что бы показать конкретный сеанс
      this.renderForTemplate(changes['templateDate'].currentValue)
    }
    if (changes['openCalendar'].currentValue && this.picker) {
      this.calendarElement.emit(this.picker)
    }
  }
  closeDatepicker() {
    this.closeCalendar.emit()
  }

  render() {
    this.dateStart = this.filterService.startDate.value
    this.dateEnd = this.filterService.endDate.value
  }
  renderForTemplate(template: any) {
    this.dateStart = template.dateStart
    this.dateEnd = template.dateEnd
  }

  ionViewDidLeave() {
    this.destroy$.next()
    this.destroy$.complete()
  }
  ngOnInit() {
    this.startDateEmit.emit({
      dateStart: moment(this.filterService.startDate.value).format('YYYY-MM-DD'),
      dateEnd: moment(this.filterService.endDate.value).format('YYYY-MM-DD'),
    })
    this.filterService.changeFilter.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.render()
    })
    this.dateRange.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe((values: any) => {
      this.setDateEmit.emit({
        dateStart: moment(values.start).format('YYYY-MM-DD'),
        dateEnd:
          moment(values.end).format('MM-DD-YYYY') !== 'Invalid date'
            ? moment(values.end).format('YYYY-MM-DD')
            : moment(values.start).format('YYYY-MM-DD'),
      })
    })
  }
}
