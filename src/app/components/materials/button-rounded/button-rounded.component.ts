import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button-rounded',
  templateUrl: './button-rounded.component.html',
  styleUrls: ['./button-rounded.component.scss'],
})
export class ButtonRoundedComponent  implements OnInit {

  constructor() { }
  @Input() buttonText:String = ''
  @Input() icon:String = ''
  @Input() type:String = ''
  @Input() theme:String = ''
  @Input() id:String = ''
  @Output() clicked:EventEmitter<void> = new EventEmitter<void>()
  ngOnInit() {}
  onClick(){
    this.clicked.emit()
  }
}
