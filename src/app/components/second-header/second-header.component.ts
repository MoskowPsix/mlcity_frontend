import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-second-header',
  templateUrl: './second-header.component.html',
  styleUrls: ['./second-header.component.scss'],
})
export class SecondHeaderComponent implements OnInit {
  @Input() size!: string
  @Input() img?: string
  constructor() {}

  ngOnInit() {}
}
