import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventTypeService } from 'src/app/services/event-type.service';
import { SightTypeService } from 'src/app/services/sight-type.service';
import { types } from 'util';

@Component({
  selector: 'app-sight-type',
  templateUrl: './sight-type.component.html',
  styleUrls: ['./sight-type.component.scss'],
})
export class SightTypeComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private sightTypeService: SightTypeService,
    private eventTypeService: EventTypeService
  ) {}

  @Input() types: any[] = [];
  @Input() typesNow: any[] = [];
  @Input() isSight: boolean = false;
  @Output() typeOutput = new EventEmitter();

  // types: any[] = []

  typesLoaded: boolean = true;
  //@Output() onChange
  typesLenght: number = 0;
  ckeckTypeCkeckbox(type: any) {
    let status = this.typesNow.find((item: any) => {
      if (item.id === type.id) {
        return true;
      } else {
        return false;
      }
    });
    return status;
  }
  outType(event: any) {
    this.typeOutput.emit(event);
  }

  test(event: any) {
    this.typeOutput.emit(event.detail.value);
  }

  getTypesSight() {
    this.sightTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        // console.log(response)
        this.types = response.types;
        response.types ? (this.typesLoaded = true) : (this.typesLoaded = false); //для скелетной анимации
        // console.log(this.types)
      });
  }
  getTypesEvent() {
    this.eventTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        // console.log(response)
        this.types = response.types;
        response.types ? (this.typesLoaded = true) : (this.typesLoaded = false); //для скелетной анимации
        // console.log(this.types)
      });
  }
  ngOnInit() {
    if (!this.types && this.isSight) {
      this.getTypesSight();
    } else if (!this.types && !this.isSight) {
      this.getTypesEvent();
    }
    // console.log(this.types)
  }
}
