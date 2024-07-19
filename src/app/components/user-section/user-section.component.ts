import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
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
  @Input() fixedImg?: string
  @Input() loadingImg?: boolean
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>()
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
  ngOnChanges(changes: any) {
    if (this.user) {
      this.checkAvatar()
    }
  }
  ngOnInit() {}
}
