import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, tap, retry, catchError, of, EMPTY, map, delay} from 'rxjs';
import { IonSegmentButton } from '@ionic/angular';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { SightsService } from 'src/app/services/sights.service';
import { ISight } from 'src/app/models/sight';
import { ISightType } from 'src/app/models/sight-type';
import { SightTypeService } from 'src/app/services/sight-type.service';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { IPlace } from 'src/app/models/place';

@Component({
  selector: 'app-eddit-sight',
  templateUrl: './eddit-sight.component.html',
  styleUrls: ['./eddit-sight.component.scss'],
})
export class EdditSightComponent  implements OnInit {
  
  constructor
  (
    private sightService: SightsService,
    private route: ActivatedRoute,
    private sightTypeService: SightTypeService,
    private locationSevices: LocationService,
    ) {}

  private readonly destroy$ = new Subject<void>()

  
  segment: number = 1;
  sight_id!: number
  btnSegment:any
  @ViewChildren(IonSegmentButton) segmentButtons!: QueryList<IonSegmentButton>
  sight!:ISight
  types: ISightType[] = []
  typesLoaded: boolean = false
  typeSelected: number | null = null
  sightFiles:any
  cityesListLoading:boolean = false //проверка загружен ли лист городов
  minLengthCityesListError:boolean = false //проверка длины списка городов
  loadSight: boolean = false
  cityesList: any[] = []
  location?: Location[] = []
  locationId!:number
  city:string  = 'Заречный'
  region:string ='Свердловская область'
  loadMap: boolean = true
  sightTime:any 
  @Input() place!:any 


  segmentClick(event:Event){
    let btn = event.target as HTMLButtonElement
    this.segment = Number(btn.value)
  }

  nextStage(){
    if(this.segment < 5){
      this.segment++
    }
  }

  backStage(){
    if(this.segment >1){
      this.segment--
    }
  }

  getUserId(){
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => { 
      this.sight_id = params['id'];      
    }); 
    
  }


  getSight(){
    this.sightService.getSightById(this.sight_id).pipe(
      retry(3),
      map((respons:any)=>{
        this.sight = respons

        console.log(this.sight.name)
        this.sightFiles = this.sight.files
        this.loadSight = true
        
        console.log(this.sight)
        this.place = this.sight
      }),
      catchError((err) =>{
        return of(EMPTY) 
      }),
    ).subscribe()
    

  }

  getNowCityes() {
    this.cityesListLoading = true
    this.locationSevices.getLocationsIds(this.locationId).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.location = response.location
      this.city = response.location.name
      this.region = response.location.location_parent.name
      this.cityesListLoading = false
    })
  }


  //получаем город
  getCityes(event: any){
    if (event.target.value.length >= 3){
      this.cityesListLoading = true
      this.minLengthCityesListError = false
      this.locationSevices.getLocationsName(event.target.value).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.cityesList = response.locations
        this.cityesListLoading = false
        console.log(response)
      })
    } else {
      this.minLengthCityesListError = true
    }
    
  }

  
  getTypes(){
    this.sightTypeService.getTypes().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.types = response.types
      //response.types ? this.typesLoaded = true :  this.typesLoaded = false //для скелетной анимации
    })
  }
  selectedType(type_id: any){
    type_id.detail.value ? this.typeSelected = type_id.detail.value  :  this.typeSelected =  null
  }


  onMapReady({target,ymaps }: YaReadyEvent<ymaps.Map>) {
    //Создаем метку 
    target.geoObjects.add(
      new ymaps.Placemark([this.place?.latitude, this.place?.longitude],{}, {
        iconLayout: 'default#imageWithContent',
        iconContentLayout: ymaps.templateLayoutFactory.createClass(`'<div class="marker"></div>'`)
      })
    )
    this.loadMap = false
  }

  ngOnInit() {
    this.getTypes()
    this.getUserId()
    this.getSight()
  }

}
