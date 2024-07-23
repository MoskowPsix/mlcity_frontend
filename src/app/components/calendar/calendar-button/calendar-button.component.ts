import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-calendar-button',
  templateUrl: './calendar-button.component.html',
  styleUrls: ['./calendar-button.component.scss'],
})
export class CalendarButtonComponent implements OnInit {
  @Input() outlineIcon: boolean = false
  openModal: boolean = true
  constructor() { }

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  })
  openDatepicker() {
    this.openModal = !this.openModal
  }

  ngOnInit() {}

}
