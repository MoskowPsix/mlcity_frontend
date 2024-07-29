import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { IEvent } from 'src/app/models/event'
import { EventsService } from 'src/app/services/events.service'
import { LoadingService } from 'src/app/services/loading.service'
@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit {
  constructor(
    private routeActivated: ActivatedRoute,
    private eventsService: EventsService,
    private loadingService: LoadingService, // LoadingService is injected
  ) {}
  private readonly destroy$ = new Subject<void>()
  event!: IEvent
  editForm!: FormGroup
  finalObject!: IEvent
  logFiles(event: any) {
    this.finalObject.files = event
  }
  ionViewWillEnter() {
    this.loadingService.showLoading()
    const eventId = this.routeActivated.snapshot.paramMap.get('id')
    this.eventsService
      .getEventById(Number(eventId))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.event = res
        console.log(res)
        this.loadingService.hideLoading()
        this.editForm.patchValue({
          name: res.name,
          sponsor: res.sponsor,
          description: res.description,
        })
      })
  }
  ngOnInit() {
    this.editForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(3)]),
    })
  }
}
