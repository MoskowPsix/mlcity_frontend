import { Component, Input, OnInit, SimpleChanges } from '@angular/core'
import { IEventType } from 'src/app/models/event-type'
import { environment } from 'src/environments/environment'
import { LoadingService } from 'src/app/services/loading.service'
import { EventTypeService } from 'src/app/services/event-type.service'
import { EventEmitter } from '@angular/core'
import { EventType } from '@angular/router'
@Component({
  selector: 'app-types-modal',
  templateUrl: './types-modal.component.html',
  styleUrls: ['./types-modal.component.scss'],
})
export class TypesModalComponent implements OnInit {
  constructor(
    private loadingService: LoadingService,
    private eventTypeService: EventTypeService,
  ) {}
  @Input() openTypesModal: boolean = false
  @Input() currentTypes: EventType[] = []
  allTypes: IEventType[] = []

  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  clickCategoryEmit = new EventEmitter()
  closeModal() {
    this.openTypesModal = false
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['openTypesModal']) {
      if (this.openTypesModal) this.getCategory()
    }
  }
  getCategory() {
    if (this.allTypes.length == 0) {
      this.loadingService.showLoading()
      this.eventTypeService
        .getTypes()
        .pipe()
        .subscribe((res: any) => {
          this.allTypes = res.types
          this.loadingService.hideLoading()
          if (res.status === 'success') {
            this.openTypesModal = true
          }
        })
    } else {
      this.openTypesModal = true
    }
  }
  clickCategory(category: any) {}
  checkCategory(category: any) {
    return false
  }
  ngOnInit() {}
}
