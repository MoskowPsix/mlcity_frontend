import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss'],
})
export class TypesComponent  implements OnInit {
  receivedData:string=''
  num?: number = 10
  @Input() type!: any[] 
  @Output() buttonClick = new EventEmitter()
  

  add(){
    this.buttonClick.emit(this.num)
  }

  constructor() { }

  onType(id: number) {
    
  }

 
  ngOnInit() {
    
  }
    
}
