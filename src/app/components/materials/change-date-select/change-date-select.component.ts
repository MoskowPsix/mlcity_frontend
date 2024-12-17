import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-change-date-select',
  templateUrl: './change-date-select.component.html',
  styleUrls: ['./change-date-select.component.scss'],
})
export class ChangeDateSelectComponent implements OnInit {
  constructor() {}
  modalValue: boolean = false
  changeModalState() {
    this.modalValue = !this.modalValue
  }
  ngOnInit() {}
}
