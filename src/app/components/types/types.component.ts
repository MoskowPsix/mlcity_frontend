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
  buttonClicked:any
  @ViewChild('typeButton')
  typeButton!: ElementRef;


 addType(id:any){
  console.log(id)
 this.typeOutput.emit(id.id)
  
 }

 addTypeHtml(element:HTMLElement){
  this.buttonClicked = element.id
  console.log(this.buttonClicked)
 }

  

  addTypeButton(){
   
  }

  ngOnInit() {

  }
    
}
