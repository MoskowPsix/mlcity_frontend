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
  @Input() selectedName: any = 'Выберите сообщество'
  @Input() closeModalValue!: boolean
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  emitOrganization(organization: any) {
    console.log(organization)
    this.selectOrganization.emit(organization)
    this.selectedName = organization.name
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
