import { Component, Input, OnInit } from '@angular/core'
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
  openOrganiztionsModal() {
    this.openModal = true
  }
  closeModal() {
    this.openModal = false
  }
  ngOnInit() {}
}
