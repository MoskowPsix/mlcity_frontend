import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

interface changeItem {
  id: number
  name: string
  value: string
  icon?: string
}
@Component({
  selector: 'app-change-date-select',
  templateUrl: './change-date-select.component.html',
  styleUrls: ['./change-date-select.component.scss'],
})
export class ChangeDateSelectComponent implements OnInit {
  constructor() {}
  @Input() modalValue: boolean = false
  @Input() items: changeItem[] = [
    { id: 1, name: 'Сегодня', value: 'Сегодня' },
    { id: 2, name: 'Завтра', value: 'Завтра' },
    { id: 3, name: 'Выходные', value: 'Выходные' },
    { id: 3, name: 'Неделя', value: 'Неделя' },
    { id: 4, name: 'Выбрать', value: 'Выбрать' },
  ]
  @Input() selectedValue!: changeItem
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() openModal: EventEmitter<any> = new EventEmitter()
  @Output() selectItem: EventEmitter<changeItem> = new EventEmitter()

  selectValue(event: changeItem) {
    this.selectItem.emit(event)
  }

  closeModalFunction() {
    this.closeModal.emit()
  }
  openModalFunction() {
    this.openModal.emit()
  }

  changeModalState() {
    if (!this.modalValue) {
      this.openModal.emit()
    } else {
      this.closeModal.emit()
    }
  }
  ngOnInit() {}
}
