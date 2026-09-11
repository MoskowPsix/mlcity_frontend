import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Route, Router } from '@angular/router'
import { IOrganization } from 'src/app/models/organization'
import { IUser } from 'src/app/models/user'
import { FileService } from 'src/app/services/file.service'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-user-section',
  templateUrl: './user-section.component.html',
  styleUrls: ['./user-section.component.scss'],
})
export class UserSectionComponent implements OnInit {
  constructor(private router: Router, private fileService: FileService) {}
  @Input() user!: IUser
  @Input() type?: string
  @Input() buttonText?: string
  @Input() organization!: IOrganization
  @Input() hideEmail?: boolean = false
  @Input() fixedImg?: string
  @Input() extensialClick: boolean = true
  @Input() showCategory: boolean = true
  @Input() loadingImg?: boolean
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>()
  @Output() selectOrganization: EventEmitter<IOrganization> = new EventEmitter<IOrganization>()
  public avatarUrl!: string
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  organizationNoTypesIcoAndFiles: boolean = false
  checkAvatar() {
    if (!this.fixedImg) {
      if (this.user.avatar && this.fileService.isAbsoluteUrl(this.user.avatar)) {
        this.avatarUrl = this.user.avatar
      } else {
        this.avatarUrl = `${this.backendUrl}${this.user.avatar}`
      }
    } else {
      this.avatarUrl = this.fixedImg
    }
  }
  checkOrganizationNoTypesIcoAndFiles() {
    if (this.organization) {
      if (
        (!this.organization.files && this.organization.types.length && !this.organization.types[0].ico) ||
        !this.organization.types.length
      ) {
        this.organizationNoTypesIcoAndFiles = true
      }
      if (this.organization.files?.length && this.organization.files[0] && !this.organization.files[0].link) {
        this.organizationNoTypesIcoAndFiles = true
      }
    }
  }
  checkAvatarOrganzization() {
    if (this.organization.files?.[0]?.link) {
      this.avatarUrl = this.fileService.checkLinkString(this.organization.files[0].link)
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
    }
  }
  ngOnChanges(changes: any) {
    if (this.user) {
      this.checkAvatar()
    }
    if (this.organization) {
      this.checkAvatarOrganzization()
      this.checkOrganizationNoTypesIcoAndFiles()
    }
  }
  ngOnInit() {}
}
