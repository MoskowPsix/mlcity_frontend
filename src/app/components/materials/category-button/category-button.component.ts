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
  public storageFilterIdCount: number = 0
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
    let storageFilterId: any

    switch (this.stateType) {
      case 'events':
        this.selectedTypesId = []
        this.currentTypes = []
        storageFilterId = this.filterService.getEventTypesFromlocalStorage()?.split(',')
        if (this.types && this.types.events?.length) {
          if (storageFilterId[0].length) {
            storageFilterId.forEach((id: any) => {
              let index = this.types.events.map((type: any) => type.id).indexOf(Number(id))
              if (!this.currentTypes.includes(this.types.events[index])) {
                this.currentTypes.push(this.types.events[index])
              }
              if (!this.selectedTypesId.includes(Number(id))) {
                this.selectedTypesId.push(Number(id))
              }
            })
            console.log(this.currentTypes)
            console.log(this.selectedTypesId)
          }

          this.typesForType = this.types.events
          this.openModal = true
        }
        break

      case 'sights':
        this.selectedTypesId = []
        this.currentTypes = []
        storageFilterId = this.filterService.getSightTypesFromlocalStorage()?.split(',')
        if (this.types && this.types.sights.length > 0) {
          if (storageFilterId[0].length) {
            console.log(storageFilterId)
            storageFilterId.forEach((id: any) => {
              let index = this.types.sights.map((type: any) => type.id).indexOf(Number(id))
              if (!this.currentTypes.includes(this.types.sights[index])) {
                this.currentTypes.push(this.types.sights[index])
              }
              if (!this.selectedTypesId.includes(Number(id))) {
                this.selectedTypesId.push(Number(id))
              }
            })
          }
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
    console.log(this.selectedTypesId)
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
      this.filterService.changeFilter.subscribe(() => {
        if (this.stateType == 'events') {
          this.storageFilterIdCount = 0
          this.filterService?.getEventTypesFromlocalStorage()!.split(',')[0] !== ''
            ? (this.storageFilterIdCount = this.filterService?.getEventTypesFromlocalStorage()!.split(',').length)
            : null
        } else if (this.stateType == 'sights') {
          this.storageFilterIdCount = 0
          this.filterService?.getSightTypesFromlocalStorage()!.split(',')[0] !== ''
            ? (this.storageFilterIdCount = this.filterService?.getSightTypesFromlocalStorage()!.split(',').length)
            : null
        }
      })
    })
  }
}
