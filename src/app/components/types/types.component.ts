import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() typesNow:any[] = []
  @Input() isSight: boolean = false
  @Output() typeOutput = new EventEmitter();
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`

  typesLoaded: boolean = true

  onType(id: number) {
    
  }

 add(){

 }

  getTypesEvent() {
    this.eventTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      // console.log(response)
      this.types = response.types
      console.log(this.types)
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
      // console.log(this.types)
    })
  }


  ngOnInit() {
    this.getTypesEvent()

  }
    
}
