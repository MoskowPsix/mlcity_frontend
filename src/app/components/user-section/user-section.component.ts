import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Route, Router } from '@angular/router'
import { IOrganization } from 'src/app/models/organization'
import { IUser } from 'src/app/models/user'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-user-section',
  templateUrl: './user-section.component.html',
  styleUrls: ['./user-section.component.scss'],
})
export class UserSectionComponent implements OnInit {
  constructor(private router: Router) {}
  @Input() user!: IUser
  @Input() type?: string
  @Input() buttonText?: string
  @Input() organization!: IOrganization
  @Input() fixedImg?: string
  @Input() extensialClick: boolean = true
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
  checkAvatarOrganzization() {
    if (this.organization.files[0]) {
      if (this.organization.files[0] && this.organization.files[0].link.includes('https')) {
        this.avatarUrl = this.organization.files[0].link
      } else {
        this.avatarUrl = `${this.backendUrl}${this.organization.files[0].link}`
      }
    }
  }
  click() {
    this.clicked.emit()
  }
  emitOrganization(organization: IOrganization) {
    this.selectOrganization.emit(organization)
  }
  redirect() {
    if (this.extensialClick) {
      this.router.navigate([`/organizations/${this.organization.id}`])
    }
  }
  ngOnChanges(changes: any) {
    if (this.user) {
      this.checkAvatar()
    }
    if (this.organization) {
      this.checkAvatarOrganzization()
    }
  }
  ngOnInit() {}
}
