import { Component, Input, OnInit, Output, SimpleChanges } from '@angular/core'
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
  @Input() openTypesModal!: boolean
  @Input() categories!: any[]
  @Output() closeModalEmit: EventEmitter<any> = new EventEmitter()
  @Output() addCategories: EventEmitter<any> = new EventEmitter()
  @Output() deleteCategories: EventEmitter<any> = new EventEmitter()
  @Input() allTypes: any

  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  clickCategoryEmit = new EventEmitter()
  closeModal() {
    this.closeModalEmit.emit(false)
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
      this.loadingService.hideLoading()
    }
  }
  addCategory(category: IEventType) {
    this.addCategories.emit(category)
  }
  deleteCategory(category: IEventType, index: number) {
    this.deleteCategories.emit(index)
  }
  clickCategory(category: any) {
    let index
    if (this.categories) {
      index = this.categories.map((e: any) => e.id).indexOf(category.id)
    } else {
      index = -1
    }

    if (index == -1) {
      this.addCategory(category)
    } else {
      this.deleteCategory(category, index)
    }
  }
  checkCategory(category: any) {
    if (this.categories) {
      let index = this.categories.map((e: any) => e.id).indexOf(category.id)
      if (index !== -1) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
  ngOnInit() {}
}
