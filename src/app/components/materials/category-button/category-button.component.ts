import { Component, OnInit } from '@angular/core'
import { IEventType } from 'src/app/models/event-type'
import { ISightType } from 'src/app/models/sight-type'
import { FilterService } from 'src/app/services/filter.service'
import { EventTypeService } from 'src/app/services/event-type.service'
import { SightTypeService } from 'src/app/services/sight-type.service'
import { remove } from 'lodash'

@Component({
  selector: 'app-category-button',
  templateUrl: './category-button.component.html',
  styleUrls: ['./category-button.component.scss'],
})
export class CategoryButtonComponent implements OnInit {
  public types!: IEventType[] | ISightType[]
  public stateType!: string

  constructor(
    private filterService: FilterService,
    private eventTypeService: EventTypeService,
    private sightTypeService: SightTypeService,
  ) { }

  getTypes() {
    switch (this.stateType) {
      case 'Event':
        this.eventTypeService.getTypes().subscribe((response) => {
          this.types = response.types
        })
        break
      case 'Sight':
        this.sightTypeService.getTypes().subscribe((response) => {
          this.types = response.types
        })
    }
  }

  setTypesToStore() {
    switch (this.stateType) {
      case 'Event':
        this.filterService.setEventTypesTolocalStorage(this.types as unknown as number[])
        this.filterService.changeFilter.next(true)
        break

      case 'Sight':
        this.filterService.setSightTypesTolocalStorage(this.types as unknown as number[])
        this.filterService.changeFilter.next(true)
        break
    }
  }

  deleteTypes(id: number) {
    for (let i = 0; i < this.types.length; i++) {
      if ((this.types[i].id = id)) {
        this.types = this.types.splice(i, 1)
      }
    }
  }

  ngOnInit() {
    this.getTypes()
  }
}
