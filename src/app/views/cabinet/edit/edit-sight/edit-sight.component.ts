import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { catchError, EMPTY, of, Subject, takeUntil, tap } from 'rxjs'
import { LoadingService } from 'src/app/services/loading.service'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
import { environment } from 'src/environments/environment'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { EditService } from 'src/app/services/edit.service'
import { SightHistoryContent } from 'src/app/clasess/history_content/sight_history_content'
import { ToastService } from 'src/app/services/toast.service'
import { SightsService } from 'src/app/services/sights.service'
import { StatusesService } from 'src/app/services/statuses.service'
import { EventsService } from 'src/app/services/events.service'
import { SightTypeService } from 'src/app/services/sight-type.service'
import { types } from 'util'
import { IPlace } from 'src/app/models/place'
import _ from 'lodash'

import { serialize } from 'object-to-formdata'
import { Statuses } from 'src/app/enums/statuses-new'
import { MessagesErrors } from 'src/app/enums/messages-errors'

@Component({
  selector: 'app-edit-sight',
  templateUrl: './edit-sight.component.html',
  styleUrls: ['./edit-sight.component.scss'],
})
export class EditSightComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  organization!: any
  editForm!: FormGroup
  previewCategory: any = []
  allTypes: any[] = []
  place!: any
  copyOrganization: any = []
  options: object = {
    indexes: true,
    indices: true,
    nullsAsUndefineds: false,
    booleansAsIntegers: false,
    allowEmptyArrays: false,
    noAttributesWithArrayNotation: false,
    noFilesWithArrayNotation: false,
    dotsForObjectNotation: false,
  }
  openTypesModalValue: boolean = false
  phoneMask = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/
  deleteConfirmValue: boolean = false
  cancelConfirmValue: boolean = false
  constructor(
    private sightsService: SightsService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService,
    private sightTypeService: SightTypeService,
    private editService: EditService,
    private toastService: ToastService,
    private eventService: EventsService,
    private router: Router,
    private statusesService: StatusesService,
  ) {}
  deleteConfirm() {
    this.deleteConfirmValue = false
    this.deleteSight()
  }
  deleteSight() {
    let currentStatusId = 0
    this.loadingService.showLoading()
    //Здесь мы редактируем sight но переменная называется organization и в себе отдельно хранит организацию
    // Для удаления нам нужно отправить именно id сообщества
    this.sightsService
      .deleteSight(this.organization.organization.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.log(err)
          this.loadingService.hideLoading()
          if (err.status == 400) {
            this.toastService.showToast(MessagesErrors.default, 'danger')
          }
          return EMPTY
        }),
      )
      .subscribe((res: any) => {
        this.loadingService.hideLoading()
        this.toastService.showToast('Сообщество успешно удалено', 'success')
        this.router.navigate(['cabinet/sights'])
      })
  }
  cancelDeleteConfirm() {
    this.deleteConfirmValue = false
  }
  cancelEdit() {
    this.cancelConfirmValue = false
  }
  cancelConfirm() {
    this.cancelConfirmValue = false
    setTimeout(() => {
      this.router.navigate(['cabinet/sights'])
    }, 0) //убираем асинхронность
  }
  deleteConfirmModal() {
    this.sightsService.getEventInSight(this.organization.id).subscribe((res: any) => {
      if (res.events.data.length) {
        this.toastService.showToast('Сообщество не может быть удалено, оно связано с событием', 'danger')
        this.deleteConfirmValue = false
      } else {
        this.deleteConfirmValue = true
      }
    })
  }
  openModalCancel() {
    this.cancelConfirmValue = true
  }
  ionViewWillEnter(): void {
    this.previewCategory = []
    let filesArray: any = []

    const eventId = this.activatedRoute.snapshot.paramMap.get('id')
    this.loadingService.showLoading()
    this.sightsService
      .getSightById(Number(eventId))
      .pipe(
        takeUntil(this.destroy$),
        tap((res: any) => {
          filesArray = JSON.parse(JSON.stringify(res.sight.files))
        }),
      )
      .subscribe((res: any) => {
        this.organization = _.cloneDeep(res.sight)
        this.copyOrganization = _.cloneDeep(this.organization)
        this.loadingService.hideLoading()
        this.editForm.patchValue({
          name: res.sight.name,
          description: res.sight.description,
          address: res.sight.address,
          latitude: res.sight.latitude,
          phone: res.sight.phone,
          site: res.sight.site,
          longitude: res.sight.longitude,
          types: _.cloneDeep(res.sight.types),
          location_id: res.sight.location_id,
        })

        this.place = {
          address: this.organization.address,
          latitude: this.organization.latitude,
          longitude: this.organization.longitude,
        }

        this.previewCategory.push(...this.organization.types!)
        filesArray.forEach((file: any) => {
          this.editForm.value.files.push(JSON.parse(JSON.stringify(file)))
        })
      })
  }
  changeAdress(event: any) {
    this.editForm.value.address = event.address
    this.editForm.value.latitude = event.latitude
    this.editForm.value.longitude = event.longitude
    this.editForm.value.location_id = event.location_id
  }
  changeFiles(event: any) {
    this.editForm.value.files = event
  }
  deleteCategory(event: any) {
    let index = this.editForm.value.types.map((e: any) => e.id).indexOf(this.previewCategory[event].id)
    if (this.editForm.value.types[index].name) {
      this.editForm.value.types[index].on_delete = true
    } else {
      this.editForm.value.types.splice(index, 1)
    }
    this.previewCategory.splice(event, 1)
  }
  addCategory(event: any) {
    this.previewCategory.push(event)
    let index = this.editForm.value.types.map((e: any) => e.id).indexOf(event.id)
    if (index == -1) {
      this.editForm.value.types.push({
        id: event.id,
      })
    } else {
      this.editForm.value.types[index].on_delete = false
    }
  }
  openTypeModal() {
    this.openTypesModalValue = true
  }
  closeModal() {
    this.openTypesModalValue = false
  }
  submitForm() {
    this.loadingService.showLoading()
    let sight_history_content = new SightHistoryContent()

    let result = sight_history_content.merge(this.copyOrganization, _.cloneDeep(this.editForm.value))
    this.editService
      .sendEditSight(serialize(result, this.options))
      .pipe(
        catchError((err: any) => {
          this.loadingService.hideLoading()

          if (err.status == 403) {
            this.toastService.showToast('Сообщество уже находится на модерации', 'warning')
          } else {
            this.toastService.showToast('Что-то пошло не так', 'error')
          }
          return of(EMPTY)
        }),
      )
      .subscribe((res: any) => {
        this.loadingService.hideLoading()
        if (res.status == 'success') {
          this.toastService.showToast('Сообщество отправленно на проверку', 'success')
          this.router.navigate(['/cabinet/sights'])
        }
      })
  }
  ngOnInit() {
    this.sightTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.allTypes = res.types
      })
    this.editForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(3)]),
      files: new FormControl([]),
      phone: new FormControl([]),
      site: new FormControl([]),
      types: new FormControl([], [Validators.required]),
      address: new FormControl('', [Validators.required]),
      latitude: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      location_id: new FormControl('', [Validators.required]),
    })
  }
}
