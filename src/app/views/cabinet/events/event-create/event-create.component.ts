import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription, switchMap, tap } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { EventTypeService } from 'src/app/services/event-type.service';
import { IUser } from 'src/app/models/user';
import { IEventType } from 'src/app/models/event-type';
import { environment } from 'src/environments/environment';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
  animations: [
    trigger('fade', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate(
              '500ms ease-in',
              style({ opacity: 1 })
          ),
      ]),
      transition(':leave', [
            animate(
                '500ms ease-in',
                style({ opacity: 0 })
            ),
      ]),   
    ]),

  ]
})

export class EventCreateComponent implements OnInit, OnDestroy {
  host: string = environment.BASE_URL
  port: string = environment.PORT
  user: IUser[] = []
  socialAccount: any
  subscriptions: Subscription[] = []
  subscription_1: Subscription = new Subscription()
  subscription_2: Subscription = new Subscription()
  subscription_3: Subscription = new Subscription()
  subscription_4: Subscription = new Subscription()
  subscription_5: Subscription = new Subscription()
  subscription_6: Subscription = new Subscription()
  step: number = 1
  vkGroups: any
  vkGroupSelected: number | null = null
  vkGroupPosts: any
  vkGroupPostsDisabled: boolean = false
  vkGroupPostSelected: any = null
  eventTypes: IEventType[] = []
  eventTypeSelected: number | null = null

  // coords!: number[];
  placemark!: ymaps.Placemark
  // search!:string
  map!:YaReadyEvent<ymaps.Map>
 
  createEventForm: FormGroup = new FormGroup({})


  constructor(private userService: UserService, private eventTypeService: EventTypeService, private mapService: MapService, private yaGeocoderService: YaGeocoderService) { }

  getUserWithSocialAccount(){
    this.subscription_1 = this.userService.getUser().pipe(
      switchMap((user: any) => {
        this.user = user
        return this.userService.setSocialAccountByUserId(user.id)
      }),
      tap(() => {
         this.getSocialAccount()
      }),
      switchMap(() => {
        return this.userService.setVkGroups(this.socialAccount.provider_id, this.socialAccount.token)
      }),
      tap(() => {
         this.getVkGroups()
      }),
    )
    .subscribe()
  }

   getSocialAccount(){
    this.subscription_2 = this.userService.getSocialAccount().subscribe((socialAccount) => {
      this.socialAccount = socialAccount
    })
  }

  getVkGroups(){
    this.subscription_3 = this.userService.getVkGroups().subscribe((response) => {
      this.vkGroups = response.response.items
      console.log(this.vkGroups)
    })
  }

  selectedVkGroup(group_id: any){
    if (group_id.detail.value) {
      this.vkGroupSelected = group_id.detail.value 
      this.setVkPostsByGroupID(group_id.detail.value )
    } else {
      this.vkGroupSelected =  null
      this.vkGroupPosts = null
    }
  }

  setVkPostsByGroupID(group_id: number){
    this.subscription_4 = this.userService.setVkPostsByGroupIp(group_id, 10, this.socialAccount.token).pipe(
      tap(() => {
        this.getVkPostsGroup()
     }),
    ).subscribe()
  }

  getVkPostsGroup(){
    this.subscription_5 = this.userService.getVkPostsGroup().subscribe((response) => {
      this.vkGroupPosts = response.response
      console.log('this.vkGroupPosts = ' + this.vkGroupPosts)
    })
  }

  selectedVkGroupPost(post: any){
    if(!post || this.vkGroupPostSelected?.id === post.id){
      this.vkGroupPostSelected = null
      this.createEventForm.patchValue({description: '' });
    } else {
      this.vkGroupPostSelected = post
      this.createEventForm.patchValue({description: this.vkGroupPostSelected.text });
    }
    console.log( JSON.stringify(this.vkGroupPostSelected))
  }

  onSubmit(){
    console.log('submit')
  }

  stepNext(){
    console.log('click ')
    if(this.step !== 11){
      this.step++
      console.log('this.step = '+ this.step)
    }   
  }

  stepPrev(){
    if(this.step !== 1){
      this.step--
    }   
  }

  // Валидатор, чтобы определить что дата начала меньше даты окончания
  dateRangeValidator(control : AbstractControl) : ValidationErrors | null
  {
    if (!control.get('dateStart')?.value || !control.get('dateEnd')?.value)
      return null;

    const from = new Date(control.get("dateStart")?.value)
    const to = new Date(control.get("dateEnd")?.value)
    let invalid = false

    if (from && to) {
      invalid = from.getTime() > to.getTime()

      if (invalid){
        return { dateInvalid: true }
      }      
    }

    return null;
  }

  getTypes(){
    this.subscription_6 = this.eventTypeService.geTypes().subscribe((response) => {
      this.eventTypes = response.types
      console.log('this.eventTypes  = ' + this.eventTypes )
    })
  }
  
  selectedType(type_id: any){
    type_id.detail.value ? this.eventTypeSelected = type_id.detail.value  :  this.eventTypeSelected =  null
    console.log('this.eventTypeSelected ' + this.eventTypeSelected)
  }

  //При клике ставим метку, если метка есть, то перемещаем ее
  onMapClick(e: YaEvent<ymaps.Map>): void {
    const { target, event } = e;
    this.createEventForm.patchValue({coords: [event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)] })
    // this.createEventForm.value.coords=[event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)]
    if (this.placemark){
      this.placemark.geometry?.setCoordinates(this.createEventForm.value.coords)
    } else  {
      this.placemark= new ymaps.Placemark(this.createEventForm.value.coords)
      target.geoObjects.add(this.placemark)
    }
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(this.createEventForm.value.coords, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      this.createEventForm.value.search = firstGeoObject.getAddressLine()

    })
  }
 
  // Поиск по улицам
  onMapReady(e: YaReadyEvent<ymaps.Map>): void {
    this.map = e;
    const search = new ymaps.SuggestView('search-map');  
    search.events.add('select',()=>{      
      this.addPlacemark()
    })
    this.mapService.geolocationMap(this.map);
  }


  //При выборе из выпадающего списка из поиска создает метку по адресу улицы
  addPlacemark(): void{
    this.createEventForm.value.search=(<HTMLInputElement>document.getElementById("search-map")).value
    const geocodeResult = this.yaGeocoderService.geocode(this.createEventForm.value.search, {
      results: 1,
    });
    geocodeResult.subscribe((result: any) => {
      try {
        const firstGeoObject = result.geoObjects.get(0);

        if (this.placemark){
          this.placemark.geometry?.setCoordinates(firstGeoObject.geometry.getCoordinates())
        } else {
          this.placemark= new ymaps.Placemark(firstGeoObject.geometry.getCoordinates())
          this.map.target.geoObjects.add(this.placemark)
        }
        // this.createEventForm.value.coords=this.placemark.geometry?.getCoordinates()
        this.createEventForm.patchValue({coords: this.placemark.geometry?.getCoordinates()})
        //центрирование карты по метки и установка зума
        this.map.target.setBounds(this.placemark.geometry?.getBounds()!, {checkZoomRange:false})
        this.map.target.setZoom(17)
      } catch (error) { 
        
      }
    }) 
}

  ngOnInit() {
    this.getUserWithSocialAccount()
    // this.eventTypeService.setTypes()
    this.getTypes()
    
    console.log(this.user)
    setTimeout(()=>
      console.log(this.socialAccount)
    ,1000)

    setTimeout(()=>
      console.log('vkGroups  ' + this.vkGroups)
    ,1000)
    
    //Создаем поля для формы
    this.createEventForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      sponsor: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('',[Validators.required, Validators.minLength(10)]),
      search: new FormControl('',[Validators.required]),
      coords: new FormControl('',[Validators.required]), 
      type:  new FormControl('',[Validators.required]),
      price: new FormControl(''),
      materials: new FormControl(''),
      dateStart: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [Validators.required]),
      dateEnd: new FormControl(new Date().toISOString().slice(0, 19) + 'Z', [Validators.required]),
    },[this.dateRangeValidator]);
    
    //Добавляем подписки в массив
    this.subscriptions.push(this.subscription_1)
    this.subscriptions.push(this.subscription_2)
    this.subscriptions.push(this.subscription_3)
    this.subscriptions.push(this.subscription_4)
    this.subscriptions.push(this.subscription_5)
    this.subscriptions.push(this.subscription_6)
  }

  ngOnDestroy(){
    // отписываемся от всех подписок
    if (this.subscriptions) {
      this.subscriptions.forEach((subscription) => {
        if (subscription){
          subscription.unsubscribe()
        }      
      })
    }  
  }

}
