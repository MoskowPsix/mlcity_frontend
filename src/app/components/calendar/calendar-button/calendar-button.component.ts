import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar-button',
  templateUrl: './calendar-button.component.html',
  styleUrls: ['./calendar-button.component.scss'],
})
export class CalendarButtonComponent implements OnInit {
  @Input() outlineIcon: boolean = false
  openModal: boolean = true
  constructor() { }

  openDatepicker() {
    this.openModal = !this.openModal
  }

  ngOnInit() {}

}
