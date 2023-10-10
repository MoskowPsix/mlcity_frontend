import { Component, Input, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventTypeService } from 'src/app/services/event-type.service';
import { SightTypeService } from 'src/app/services/sight-type.service';

@Component({
  selector: 'app-sight-type',
  templateUrl: './sight-type.component.html',
  styleUrls: ['./sight-type.component.scss'],
})

export class SightTypeComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()
  
  constructor(
    private sightTypeService: SightTypeService,
    private eventTypeService: EventTypeService,
  ) { }
  @Input() types: any[] = []
  @Input() isSight: boolean = false

  // types: any[] = []

  typesLoaded: boolean = true
  //@Output() onChange

  getTypesSight() {
    this.sightTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      // console.log(response)
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
      // console.log(this.types)
    })
  }
  getTypesEvent() {
    this.eventTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      // console.log(response)
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
      // console.log(this.types)
    })
  }
  ngOnInit() {
    if (!this.types && this.isSight){
      this.getTypesSight()
    } else if (!this.types && !this.isSight) {
      this.getTypesEvent()
    }
    // console.log(this.types)
  }

}
