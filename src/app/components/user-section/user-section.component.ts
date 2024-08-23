import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IOrganization } from 'src/app/models/organization'
import { IUser } from 'src/app/models/user'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-user-section',
  templateUrl: './user-section.component.html',
  styleUrls: ['./user-section.component.scss'],
})
export class UserSectionComponent implements OnInit {
  constructor() {}
  @Input() user!: IUser
  @Input() type?: string
  @Input() buttonText?: string
  @Input() organization!: IOrganization
  @Input() fixedImg?: string
  @Input() loadingImg?: boolean
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>()
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  public avatarUrl!: string
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  checkAvatar() {
    if (!this.fixedImg) {
      if (this.user.avatar && this.user.avatar.includes('https')) {
        this.avatarUrl = this.user.avatar
      } else {
        this.avatarUrl = `${this.backendUrl}${this.user.avatar}`
      }
    } else {
      this.avatarUrl = this.fixedImg
    }
  }
  click() {
    this.clicked.emit()
  }
  emitOrganization(organization: IOrganization){
    this.selectOrganization.emit(organization)
  }
  ngOnChanges(changes: any) {
    if (this.user) {
      this.checkAvatar()
    }
  }
  ngOnInit() {}
}
