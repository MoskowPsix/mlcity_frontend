import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-standart-button-long',
  templateUrl: './standart-button-long.component.html',
  styleUrls: ['./standart-button-long.component.scss'],
})
export class StandartButtonLongComponent  implements OnInit {

  constructor() { }
  @Input() buttonText:String = ''
  @Input() icon:String = ''
  @Input() type:String = ''
  @Output() clicked:EventEmitter<void> = new EventEmitter<void>()
  @ViewChild('button') btn!:ElementRef
  buttonSize:any = ''
  onClick(){
    this.clicked.emit()
  }

  ngOnInit() {}

}
