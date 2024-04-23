import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.scss'],
})
export class MiniCardComponent  implements OnInit {

  @Input() image!: string
  @Input() title!: string
  @Input() description!: string
  constructor() { }

  ngOnInit() {}

}
