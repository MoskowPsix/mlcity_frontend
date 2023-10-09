import { Component, Input, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
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
  ) { }
  @Input() types!: any[]

  typesLoaded: boolean = true
  //@Output() onChange

  getTypes() {
    this.sightTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.types = response.types
      response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
    })
    console.log(this.types)
  }
  ngOnInit() {
    if (!this.types){
      this.getTypes()
    }
    console.log(this.types)
  }

}
