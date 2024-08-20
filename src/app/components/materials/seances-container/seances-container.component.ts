import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-seances-container',
  templateUrl: './seances-container.component.html',
  styleUrls: ['./seances-container.component.scss'],
})
export class SeancesContainerComponent implements OnInit {
  constructor() {}
  @Input() seances!: any[]
  @Input() priceState!: string
  ngOnInit() {}
}
