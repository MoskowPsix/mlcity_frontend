import { Component, OnInit } from '@angular/core'
import { FilterService } from 'src/app/services/filter.service'

@Component({
  selector: 'app-range-selection-button',
  templateUrl: './range-selection-button.component.html',
  styleUrls: ['./range-selection-button.component.scss'],
})
export class RangeSelectionButtonComponent implements OnInit {
  state: boolean = false
  radiusRange: number[] = [1, 2, 5, 10, 25]
  currentRange!: number

  constructor(private filterService: FilterService) {}

  changeState() {
    this.state = !this.state
    
  }

  changeRadius(value: number) {
    this.filterService.setRadiusTolocalStorage(`${value}`)
  }
  ngOnInit() {
    this.filterService.radius.subscribe((radius: string) => {
      this.currentRange = Number(radius)
    })
  }
}
