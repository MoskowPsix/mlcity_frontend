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
@Component({
  selector: 'app-edit-sight',
  templateUrl: './edit-sight.component.html',
  styleUrls: ['./edit-sight.component.scss'],
})
export class EditSightComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(
    private sightsService: SightsService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ionViewWillEnter(): void {
    const eventId = this.activatedRoute.snapshot.paramMap.get('id')
    this.sightsService
      .getSightById(Number(eventId))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        console.log(res)
      })
  }
  ngOnInit() {}
}
