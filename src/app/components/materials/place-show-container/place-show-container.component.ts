import { Component, Input, OnInit } from '@angular/core'
import { IPlace } from 'src/app/models/place'
import { IPrice } from 'src/app/models/price'

@Component({
  selector: 'app-place-show-container',
  templateUrl: './place-show-container.component.html',
  styleUrls: ['./place-show-container.component.scss'],
})
export class PlaceShowContainerComponent implements OnInit {
  constructor() {}
  @Input() places: IPlace[] = []
  @Input() prices: IPrice[] = []
  @Input() priceState!: string
  @Input() buyLink!:string
  ngOnInit() {}
}
