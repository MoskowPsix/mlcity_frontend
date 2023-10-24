import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, delay, EMPTY, map, of, retry, Subject, takeUntil, tap, debounceTime } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { ISight } from 'src/app/models/sight';
import { ToastService } from 'src/app/services/toast.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { SightsService } from 'src/app/services/sights.service';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-sights',
  templateUrl: './sights.component.html',
  styleUrls: ['./sights.component.scss'],
})
export class SightsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  city: string = ''
  segment:string = 'sightsCitySegment'

  sightsCity: ISight[] = []
  sightsGeolocation: ISight[] = []

  loadingSightsCity: boolean = false
  loadingSightsGeolocation: boolean = false

  loadingMoreSightsCity: boolean = false
  loadingMoreSightsGeolocation: boolean = false

  currentPageSightsCity: number = 1
  currentPageSightsGeolocation: number = 1

  nextPage: boolean = false

  sightTypeId: any

  constructor(
    private sightsService: SightsService,
    private toastService: ToastService,
 
    private filterService: FilterService,
    private queryBuilderService: QueryBuilderService,
    private navigationService: NavigationService,
    private locationService: LocationService
  ) { }

  getSightsCity(){
    this.loadingMoreSightsCity ? this.loadingSightsCity = true : this.loadingSightsCity = false

    this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsPublicForCityTab')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        console.log(respons)
        this.sightsCity.push(...respons.sights.data)
        this.filterService.setSightsCount(respons.total)
        this.queryBuilderService.paginationPublicSightsCityCurrentPage.next(respons.sights.next_cursor)
        respons.sights.next_cursor ? this.nextPage = true : this.nextPage = false
      }),
      tap(() => {
        this.loadingSightsCity = true  
        this.loadingMoreSightsCity = false
      }),
      catchError((err) =>{
        this.toastService.showToast(MessagesErrors.default, 'danger')
        this.loadingSightsCity = false
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  // getSightsGeolocation(){
  //   this.loadingMoreSightsGeolocation ? this.loadingSightsGeolocation = true : this.loadingSightsGeolocation = false

  //   this.sightsService.getSights(this.queryBuilderService.queryBuilder('sightsPublicForGeolocationTab')).pipe(
  //     delay(100),
  //     retry(3),
  //     map((respons:any) => {
  //       this.sightsGeolocation.push(...respons.sights.data)
  //       this.totalPagesSightsGeolocation = respons.sights.last_page
  //       //this.queryBuilderService.paginationPublicEventsCityTotalPages.next(respons.events.last_page)
  //     }),
  //     tap(() => {
  //       this.loadingSightsGeolocation = true  
  //       this.loadingMoreSightsGeolocation = false
  //     }),
  //     catchError((err) =>{
  //       this.toastService.showToast(MessagesErrors.default, 'danger')
  //       this.loadingSightsGeolocation = false
  //       return of(EMPTY) 
  //     }),
  //     takeUntil(this.destroy$)
  //   ).subscribe()
  // }

  sightsCityLoadingMore(){
    this.loadingMoreSightsCity = true
    this.currentPageSightsCity++
    // this.queryBuilderService.paginationPublicSightsCityCurrentPage.next(this.currentPageSightsCity)
    this.getSightsCity()
  }

  // sightsGeolocationLoadingMore(){
  //   this.loadingMoreSightsGeolocation = true
  //   this.currentPageSightsGeolocation++
  //   this.queryBuilderService.paginationPublicSightsGeolocationCurrentPage.next(this.currentPageSightsGeolocation)
  //   this.getSightsGeolocation()
  // }

  onSegmentChanged(event: any){
    this.segment = event.detail.value
  }

  ngOnInit() {
    this.sightsCity = []
    this.sightsGeolocation = []
    this.getSightsCity()
    // this.getSightsGeolocation()

    //Подписываемся на изменение фильтра 
    this.filterService.changeFilter.pipe(debounceTime(1000),takeUntil(this.destroy$)).subscribe((value) => {
      if (value === true){
        this.sightsCity = []
        this.sightsGeolocation = []
        this.getSightsCity()
        // this.getSightsGeolocation()
      }
      this.navigationService.appFirstLoading.next(false)// чтобы удалялся фильтр,
    })

    //Подписываемся на город
    this.filterService.locationId.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.locationService.getLocationsIds(value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.city = response.location.name
      })
    })
    this.filterService.sightTypes.pipe(takeUntil(this.destroy$)).subscribe((value:any) => {
      this.sightTypeId = value[0]
    });

  }

  sightTypesChange(typeId: any){
    if (typeId !== 'all') {
      this.filterService.setSightTypesTolocalStorage([typeId])
      this.filterService.changeFilter.next(true)
    } else {
      this.filterService.setSightTypesTolocalStorage([])
      this.filterService.changeFilter.next(true)
    }
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }

}
