import { Component, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { IEventType } from 'src/app/models/event-type'
import { environment } from 'src/environments/environment'
import { LoadingService } from 'src/app/services/loading.service'
import { EventTypeService } from 'src/app/services/event-type.service'
import { EventEmitter } from '@angular/core'
import { Subject, takeUntil, catchError, EMPTY, finalize } from 'rxjs'
import { CategorySuggestionService } from 'src/app/services/category-suggestion.service'
import { ToastService } from 'src/app/services/toast.service'

@Component({
  selector: 'app-types-modal',
  templateUrl: './types-modal.component.html',
  styleUrls: ['./types-modal.component.scss'],
})
export class TypesModalComponent implements OnInit, OnDestroy {
  constructor(
    private loadingService: LoadingService,
    private eventTypeService: EventTypeService,
    private categorySuggestionService: CategorySuggestionService,
    private toastService: ToastService,
    private fb: FormBuilder,
  ) {
    this.suggestForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    })
  }

  @Input() openTypesModal!: boolean
  @Input() categories!: any[]
  @Output() closeModalEmit: EventEmitter<any> = new EventEmitter()
  @Output() addCategories: EventEmitter<any> = new EventEmitter()
  @Output() deleteCategories: EventEmitter<any> = new EventEmitter()
  @Output() clearAllCategoriesEmit: EventEmitter<any> = new EventEmitter()
  @Input() allTypes: any = []
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  clickCategoryEmit = new EventEmitter()
  showSuggestForm = false
  suggestSubmitting = false
  suggestForm: FormGroup
  private readonly destroy$ = new Subject<void>()

  closeModal() {
    this.showSuggestForm = false
    this.suggestForm.reset()
    this.closeModalEmit.emit(false)
  }

  openSuggestForm(event?: Event) {
    event?.stopPropagation()
    this.showSuggestForm = true
  }

  closeSuggestForm() {
    this.showSuggestForm = false
    this.suggestForm.reset()
  }

  submitSuggestion() {
    if (this.suggestForm.invalid || this.suggestSubmitting) {
      this.suggestForm.markAllAsTouched()
      return
    }

    const { name, description } = this.suggestForm.value
    this.suggestSubmitting = true
    this.loadingService.showLoading()

    this.categorySuggestionService
      .createSuggestion({
        name: String(name).trim(),
        description: String(description).trim(),
      })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.toastService.showToast('Не удалось отправить предложение', 'danger')
          return EMPTY
        }),
        finalize(() => {
          this.suggestSubmitting = false
          this.loadingService.hideLoading()
        }),
      )
      .subscribe((res) => {
        if (res?.status === 'success') {
          this.toastService.showToast('Спасибо! Предложение отправлено', 'success')
          this.closeSuggestForm()
        } else {
          this.toastService.showToast('Не удалось отправить предложение', 'danger')
        }
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['openTypesModal']) {
      if (this.openTypesModal) {
        this.showSuggestForm = false
        this.getCategory()
      } else {
        this.showSuggestForm = false
        this.suggestForm.reset()
      }
    }
  }

  getCategory() {
    if (this.allTypes.length == 0) {
      this.loadingService.showLoading()
      this.eventTypeService
        .getTypes()
        .pipe(takeUntil(this.destroy$))
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

  clearAllCategories() {
    this.clearAllCategoriesEmit.emit(true)
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

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
