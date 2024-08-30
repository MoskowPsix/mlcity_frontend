import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { catchError, EMPTY, of, Subject, takeUntil, tap } from 'rxjs'
import { LoadingService } from 'src/app/services/loading.service'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
import { environment } from 'src/environments/environment'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { EditService } from 'src/app/services/edit.service'
import { SightHistoryContent } from 'src/app/clasess/history_content/sight_history_content'
import { ToastService } from 'src/app/services/toast.service'
import { SightsService } from 'src/app/services/sights.service'
import { ISight } from 'src/app/models/sight'
import { SightTypeService } from 'src/app/services/sight-type.service'
import { types } from 'util'
import { IPlace } from 'src/app/models/place'

@Component({
  selector: 'app-edit-sight',
  templateUrl: './edit-sight.component.html',
  styleUrls: ['./edit-sight.component.scss'],
})
export class EditSightComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  organization!: ISight
  editForm!: FormGroup
  previewCategory: any = []
  allTypes: any[] = []
  place!: any
  openTypesModalValue: boolean = false
  constructor(
    private sightsService: SightsService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService,
    private sightTypeService: SightTypeService,
  ) {}

  ionViewWillEnter(): void {
    this.previewCategory = []

    const eventId = this.activatedRoute.snapshot.paramMap.get('id')
    this.loadingService.showLoading()
    this.sightsService
      .getSightById(Number(eventId))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.organization = res
        this.loadingService.hideLoading()
        this.editForm.patchValue({
          name: this.organization.name,
          description: this.organization.description,
          adress: this.organization.address,
          lalitude: this.organization.latitude,
          longitude: this.organization.longitude,
          types: this.organization.types,
          location_id: this.organization.location_id,
          files: res.files,
        })
        this.place = {
          address: this.organization.address,
          latitude: this.organization.latitude,
          longitude: this.organization.longitude,
        }
        console.log(this.place)
        this.previewCategory.push(...this.organization.types!)
        console.log(this.organization)
      })
  }
  changeAdress(event: any) {
    this.editForm.value.adress = event.address
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
    console.log(this.editForm.value)
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
    console.log(this.editForm.value)
    let sight_history_content = new SightHistoryContent()
    console.log(sight_history_content.merge(this.organization, this.editForm.value))
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
      types: new FormControl([], [Validators.required]),
      adress: new FormControl('', [Validators.required]),
      lalitude: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      location_id: new FormControl('', [Validators.required]),
    })
  }
}
