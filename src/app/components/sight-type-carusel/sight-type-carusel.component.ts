import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventTypeService } from 'src/app/services/event-type.service';
import { SightTypeService } from 'src/app/services/sight-type.service';

@Component({
  selector: 'app-sight-type-carusel',
  templateUrl: './sight-type-carusel.component.html',
  styleUrls: ['./sight-type-carusel.component.scss'],
})
export class SightTypeCaruselComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()

  @Output() typeOutput = new EventEmitter();
  @ViewChild('wigetScroll') wigetScroll!: ElementRef;
  scroll?: any
  typesLoaded: boolean = true
  types: any[] = []
  type_id!: number

  constructor(
    private eventTypeService: EventTypeService,
    private sightTypeService: SightTypeService
  ) { }

  scrollLeft() {
    this.wigetScroll.nativeElement.scrollTo({ left: (this.wigetScroll.nativeElement.scrollLeft - this.scroll), behavior: 'smooth' });
  }
  scrollRight() {
    this.wigetScroll.nativeElement.scrollTo({ left: (this.wigetScroll.nativeElement.scrollLeft + this.scroll), behavior: 'smooth' });
  }

  getTypesEvent() {
    this.sightTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      // console.log(response)
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
      // console.log(this.types)
    })
  }
  getTypeId(id: any) {
    this.type_id = id
    this.onTypeOutput()
  }
  onTypeOutput() {
    this.typeOutput.emit(this.type_id)
  }

  ngOnInit() {
    this.getTypesEvent()
    if(!this.scroll) {this.scroll = 300}
  }

}
