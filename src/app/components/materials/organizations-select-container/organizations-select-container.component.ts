import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { InfiniteScrollCustomEvent } from '@ionic/angular'
import { IOrganization } from 'src/app/models/organization'

@Component({
  selector: 'app-organizations-select-container',
  templateUrl: './organizations-select-container.component.html',
  styleUrls: ['./organizations-select-container.component.scss'],
})
export class OrganizationsSelectContainerComponent implements OnInit {
  constructor() {}

  @Input() cards!: IOrganization[]
  @Input() selectedName: any = ''
  @Input() spiner: boolean = false
  @Output() endScroll: EventEmitter<any> = new EventEmitter()
  @Input() modalValue!: boolean
  @Output() openModal: EventEmitter<any> = new EventEmitter()
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  emitOrganization(organization: any) {
    this.selectOrganization.emit(organization)
  }
  ngOnChanges(changes: SimpleChanges): void {}
  openOrganiztionsModal() {
    this.openModal.emit()
  }
  closeModalEmit() {
    this.closeModal.emit()
  }
  onIonInfinite(event: any) {
    let trueEvent = event as InfiniteScrollCustomEvent
    this.endScroll.emit()

    trueEvent.target.complete()
  }
  ngOnInit() {}
}
