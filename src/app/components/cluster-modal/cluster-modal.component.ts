import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { BehaviorSubject, Subject, takeUntil } from 'rxjs'
import { IEvent } from 'src/app/models/event'
import { ISight } from 'src/app/models/sight'
import { SwitchTypeService } from 'src/app/services/switch-type.service'
@Component({
  selector: 'app-cluster-modal',
  templateUrl: './cluster-modal.component.html',
  styleUrls: ['./cluster-modal.component.scss'],
})
export class ClusterModalComponent implements OnInit {
  constructor(private switchTypeService: SwitchTypeService) {}
  @Input() openModal: boolean = false
  @Output() closeModalEmit: EventEmitter<any> = new EventEmitter()
  @Input() modalContent: any = []
  type: string = ''
  private readonly destroy$ = new Subject<void>()
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.modalContent)
  }
  closeModal() {
    this.closeModalEmit.emit()
  }
  ngOnInit() {
    this.switchTypeService.currentType.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      this.type = value
      console.log(this.type)
    })
  }
}
