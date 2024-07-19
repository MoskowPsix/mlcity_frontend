import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-circle-button',
  templateUrl: './circle-button.component.html',
  styleUrls: ['./circle-button.component.scss'],
})
export class CircleButtonComponent  implements OnInit {

  constructor() { }
  @Input() buttonText:String = ''
  @Input() icon:String = ''
  @Input() type:String = ''
  @Input() theme:String = ''
  @Input() id:String = ''
  @Output() clicked:EventEmitter<void> = new EventEmitter<void>()
  onClick(){
    this.clicked.emit()
  }
  ngOnInit() {}

}
