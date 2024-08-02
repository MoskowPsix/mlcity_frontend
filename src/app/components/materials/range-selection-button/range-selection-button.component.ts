import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-range-selection-button',
  templateUrl: './range-selection-button.component.html',
  styleUrls: ['./range-selection-button.component.scss'],
})
export class RangeSelectionButtonComponent implements OnInit {
  state: boolean = true
  constructor() { }

  changeState() {
    this.state = !this.state
    console.log('share')
  }
  ngOnInit() { }
}
