import { Component, Input, OnInit, Output } from '@angular/core'
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent implements OnInit {
  constructor() {}
  @Input() openModal: boolean = false
  @Input() text: string = 'Вы уверены?'
  @Output() cancel: EventEmitter<any> = new EventEmitter()
  @Output() confirm: EventEmitter<any> = new EventEmitter()
  closeModal() {
    this.cancel.emit()
  }

  confirmModal() {
    this.confirm.emit()
  }

  ngOnInit() {}
}
