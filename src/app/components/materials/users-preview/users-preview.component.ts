import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { InfiniteScrollCustomEvent } from '@ionic/angular'
import { IUser } from 'src/app/models/user'
import { FileService } from 'src/app/services/file.service'
@Component({
  selector: 'app-users-preview',
  templateUrl: './users-preview.component.html',
  styleUrls: ['./users-preview.component.scss'],
})
export class UsersPreviewComponent implements OnInit {
  @Input() moreCount!: string
  @Input() fullValueUsers!: string
  @Input() openUsersModal: boolean = false
  @Input() users: IUser[] = []
  usersPreview: any[] = []
  @Input() spiner: boolean = false
  @Output() openModalEmit: EventEmitter<any> = new EventEmitter()
  @Output() endScroll: EventEmitter<any> = new EventEmitter()
  @Output() closeModalEmit: EventEmitter<any> = new EventEmitter()
  constructor(public fileService: FileService) {}

  openModal() {
    this.openModalEmit.emit()
  }
  onIonInfinite(event:any){
    
      let trueEvent = event as InfiniteScrollCustomEvent
      this.endScroll.emit()
      trueEvent.target.complete()
  }
  closeModal() {
    this.closeModalEmit.emit()
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.usersPreview = this.users.slice(0, 12)
  }
  ngOnInit() {}
}
