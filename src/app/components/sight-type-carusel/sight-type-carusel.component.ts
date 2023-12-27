import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @ViewChild('wigetSightScroll') wigetSightScroll!: ElementRef;
  scroll?: any
  typesLoaded: boolean = true
  types: any[] = []
  @Input() type_id: any

  constructor(
    private sightTypeService: SightTypeService
  ) { }

  scrollLeft() {
    this.wigetSightScroll.nativeElement.scrollTo({ left: (this.wigetSightScroll.nativeElement.scrollLeft - this.scroll), behavior: 'smooth' });
  }
  scrollRight() {
    this.wigetSightScroll.nativeElement.scrollTo({ left: (this.wigetSightScroll.nativeElement.scrollLeft + this.scroll), behavior: 'smooth' });
  }

  getTypesEvent() {
    this.sightTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
    })
  }
  getTypeId(id: any) {
    this.type_id = id
    this.onTypeOutput()
    this.fixCenterElement(id)
  }
  onTypeOutput() {
    this.typeOutput.emit(this.type_id)
  }

  fixCenterElement(type_id: any) {
    var elem = this.wigetSightScroll.nativeElement.offsetWidth
    let left = document.getElementById(type_id+'sight')!.offsetLeft
    let right = elem - document.getElementById(type_id+'sight')!.offsetLeft  
    // console.log( this.wigetSightScroll.nativeElement)
    if (left > right) {
      this.wigetSightScroll.nativeElement.scrollTo({left: left - elem/2, behavior: 'smooth'})
    } else if (right > left) {
      this.wigetSightScroll.nativeElement.scrollTo({right:right - elem/2, behavior: 'smooth'})
    }
  }

  ngOnInit() {
    this.getTypesEvent()
    if(!this.scroll) {this.scroll = 300}
    if(!this.type_id) {this.type_id = 'all'}
    setTimeout(() => {this.fixCenterElement(this.type_id)}, 5000) 
  }

}
