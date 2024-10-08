import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { IOrganization } from 'src/app/models/organization'

@Component({
  selector: 'app-organizations-select-container',
  templateUrl: './organizations-select-container.component.html',
  styleUrls: ['./organizations-select-container.component.scss'],
})
export class OrganizationsSelectContainerComponent implements OnInit {
  constructor() {}
  openModal: boolean = true
  @Input() cards!: IOrganization[]
  @Input() selectedName: any = ''
  @Input() closeModalValue!: boolean
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  emitOrganization(organization: any) {
    this.selectOrganization.emit(organization)
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.closeModal()
  }
  openOrganiztionsModal() {
    this.openModal = true
  }
  closeModal() {
    this.openModal = false
  }
  ngOnInit() {}
}
