import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-change-location-modal',
  templateUrl: './change-location-modal.component.html',
  styleUrls: ['./change-location-modal.component.scss'],
})
export class ChangeLocationModalComponent implements OnInit {
  @Input() open!: boolean
  constructor() {}

  ngOnInit() {}
}
