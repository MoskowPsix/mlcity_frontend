import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { catchError, EMPTY, of, Subject, takeUntil } from 'rxjs'
import { LoadingService } from 'src/app/services/loading.service'
import { OrganizationService } from 'src/app/services/organization.service'
import { ToastService } from 'src/app/services/toast.service'
import { serialize } from 'object-to-formdata'
import { Router } from '@angular/router'
import { FilterService } from 'src/app/services/filter.service'
import { fileTypeValidator } from 'src/app/validators/file-type.validators'
import { fileOneTypeValidator } from 'src/app/validators/file-one-type.validators'
import { LocationService } from 'src/app/services/location.service'

@Component({
  selector: 'app-organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss'],
})
export class OrganizationCreateComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(
    private filtersService: FilterService,
    private locationService: LocationService,
    private organizationService: OrganizationService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router,
  ) {}

  locationName: string = ''
  locationSubName: string = ''
  inputSearchLocation: string = ''
  locationsSearch: Location[] = []

  createForm: FormGroup = new FormGroup({
    avatar: new FormControl(null, fileOneTypeValidator(['png', 'jpg', 'jpeg'])),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    typeId: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]),
    locationId: new FormControl(this.filtersService.getLocationFromlocalStorage(), [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(4),
    ]),
    description: new FormControl('', [Validators.required]),
  })

  submitCreate(): void {
    if (this.createForm.valid) {
      this.loadingService.showLoading()
      this.organizationService
        .createOrganization(serialize(this.createForm.value))
        .pipe(
          takeUntil(this.destroy$),
          catchError((err: any) => {
            this.loadingService.hideLoading()
            return of(EMPTY)
          }),
        )
        .subscribe((response: any) => {
          this.loadingService.hideLoading()
          this.toastService.showToast('Организация создана успешно', 'success')
          this.createForm.reset()
          this.router.navigate(['/cabinet'])
        })
    } else {
      this.toastService.showToast('Не все поля заполнены корректно', 'warning')
    }
  }
  searchLocation(search: string): void {
    if (search.length >= 3) {
      this.locationService.getLocationsName(search).subscribe((response: any) => {
        console.log(response)
        // this.locationName = response.location.name
        // this.locationSubName = response.location.location_parent.name
      })
    }
  }
  setLocationForId(id: number): void {
    if (id) {
      this.locationService.getLocationsIds(id).subscribe((response: any) => {
        console.log(response)
        this.locationName = response.location.name
        this.locationSubName = response.location.location_parent.name
        this.createForm.patchValue({
          locationId: id,
        })
      })
    }
  }

  ngOnInit(): void {
    this.filtersService.locationId.subscribe((locationId: number) => {
      this.setLocationForId(locationId)
    })
  }
}
