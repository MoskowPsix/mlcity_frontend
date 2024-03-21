import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Console } from 'console';
import { Subject, takeUntil } from 'rxjs';
import { EventTypeService } from 'src/app/services/event-type.service';
import { SightTypeService } from 'src/app/services/sight-type.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss'],
})
export class TypesComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()
  
  constructor(
    private sightTypeService: SightTypeService,
    private eventTypeService: EventTypeService,
  ) { }
  
  @Input() types: any[] = []

  @Output() typeOutput = new EventEmitter();
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  typesLoaded: boolean = true
  @Input() buttonClicked:any
  @ViewChild('typeButton')
  typeButton!: ElementRef;
  start!: Number

  addType(id:any){
    let count: Number = 0
    this.types.forEach(value => {
      if(this.checkIds(value.id)) {
        count =+ 1
      }
    })
    if (count == 0) {
      this.start = id.id
    }
      
    this.typeOutput.emit(id.id)
  }

  checkIds(id: number) {
    let type_id
    this.buttonClicked.find((val:any) => {
      if(id == val) {
        type_id = true
      }
    })
    return type_id
  }

  ngOnInit() {

  }
    
}
