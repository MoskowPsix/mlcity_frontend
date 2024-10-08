import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IOrganization } from 'src/app/models/organization'
import { RouterLink } from '@angular/router'
@Component({
  selector: 'app-organizations-card',
  templateUrl: './organizations-card.component.html',
  styleUrls: ['./organizations-card.component.scss'],
})
export class OrganizationsCardComponent implements OnInit {
  constructor() {}
  @Input() card!: IOrganization
  @Input() buttonType: string = ''
  @Input() extensialClick: boolean = true
  @Output() organizationClicked: EventEmitter<any> = new EventEmitter()
  organizationObject: any = {}
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  emitOrganization(organization: any) {
    this.organizationClicked.emit(organization.id)
  }
  organizationNavigation(){

  }
  ngOnInit() {
    this.organizationObject = this.card
  }
}
