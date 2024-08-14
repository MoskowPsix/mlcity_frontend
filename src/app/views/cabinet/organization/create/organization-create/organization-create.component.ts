import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { catchError, EMPTY, of, Subject, takeUntil } from 'rxjs'
import { LoadingService } from 'src/app/services/loading.service'
import { OrganizationService } from 'src/app/services/organization.service'
import { ToastService } from 'src/app/services/toast.service'
import { serialize } from 'object-to-formdata'
import { Router } from '@angular/router'

interface InvalidForm {
  name: boolean
  inn: boolean
  ogrn: boolean
  kpp: boolean
  number: boolean
  description: boolean
}
@Component({
  selector: 'app-organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss'],
})
export class OrganizationCreateComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(
    private organizationService: OrganizationService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router,
  ) {}
  invalidForm: InvalidForm = {
    name: true,
    inn: true,
    ogrn: true,
    kpp: true,
    number: true,
    description: false,
  }
  createForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    inn: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    ogrn: new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
    kpp: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]),
    number: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    description: new FormControl('', [Validators.required]),
  })

  submitCreate(): void {
    console.log(this.createForm.controls['number'].valid)
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

  ngOnInit(): void {}
}
