import { Component, Input, OnInit } from '@angular/core'
import { IOrganization } from 'src/app/models/organization'

@Component({
  selector: 'app-organizations-card',
  templateUrl: './organizations-card.component.html',
  styleUrls: ['./organizations-card.component.scss'],
})
export class OrganizationsCardComponent implements OnInit {
  constructor() {}
  @Input() card!: IOrganization
  organizationObject: any = {}
  ngOnInit() {
    console.log(this.card)
    this.organizationObject = {
      name: this.card.name,
      avatar: this.card.avatar,
    }
  }
}
