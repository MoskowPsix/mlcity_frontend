import { Component, Input, OnInit } from '@angular/core'
import { IEventType } from 'src/app/models/event-type'
import { ISightType } from 'src/app/models/sight-type'
import { FilterService } from 'src/app/services/filter.service'
import { EventTypeService } from 'src/app/services/event-type.service'
import { SightTypeService } from 'src/app/services/sight-type.service'
import { remove } from 'lodash'
import { LoadingService } from 'src/app/services/loading.service'
import { SwitchTypeService } from 'src/app/services/switch-type.service'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-category-button',
  templateUrl: './category-button.component.html',
  styleUrls: ['./category-button.component.scss'],
})
export class CategoryButtonComponent implements OnInit {
  constructor(
    private filterService: FilterService,
    private eventTypeService: EventTypeService,
    private sightTypeService: SightTypeService,
    private loadingService: LoadingService,
    private switchTypeService: SwitchTypeService,
  ) {}
  public types: any = {
    events: [],
    sights: [],
  }
  public typesForType: any
  @Input() stateType!: string
  public openModal!: boolean
  public typesString = ''
  public selectedTypesId: number[] = []
  @Input() currentTypes: IEventType[] | ISightType[] = []
  private readonly destroy$ = new Subject<void>()
  getTypes() {
    this.loadingService.showLoading()
    this.eventTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.types.events = response.types
      })
    this.sightTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(this.types)
        this.types.sights = response.types
        this.loadingService.hideLoading()
      })
  }

  setTypesToStore() {
    switch (this.stateType) {
      case 'events':
        this.filterService.setEventTypesTolocalStorage(this.selectedTypesId as unknown as number[])
        this.filterService.changeFilter.next(true)
        break

      case 'sights':
        this.filterService.setSightTypesTolocalStorage(this.selectedTypesId as unknown as number[])
        this.filterService.changeFilter.next(true)
        break
    }
  }

  // deleteTypes(id: number) {
  //   for (let i = 0; i < this.types.length; i++) {
  //     if ((this.types[i].id = id)) {
  //       this.types = this.types.splice(i, 1)
  //     }
  //   }
  // }

  openModalFnc() {
    switch (this.stateType) {
      case 'events':
        if (this.types && this.types.events.length > 0) {
          this.typesForType = this.types.events
          this.openModal = true
        }
        break

      case 'sights':
        if (this.types && this.types.sights.length > 0) {
          this.typesForType = this.types.sights
          this.openModal = true
        }
        break
    }
  }
  closeModal() {
    this.openModal = false
  }
  addCaategory(category: any) {
    this.currentTypes.push(category)
    this.selectedTypesId.push(category.id)

    this.setTypesToStore()
  }
  deleteCaategory(index: any) {
    let categoryId = this.currentTypes[index].id
    remove(this.selectedTypesId, (id) => id === categoryId)
    this.currentTypes.splice(index, 1)
    console.log('удалил')
    this.setTypesToStore()
  }

  ngOnInit() {
    this.getTypes()
    this.switchTypeService.currentType.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.stateType = value
    })
  }
}
