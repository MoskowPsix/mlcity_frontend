import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private nowDate: Date = new Date()
  // public city: BehaviorSubject<any> = new BehaviorSubject(this.setCityTolocalStorage())
  // public region: BehaviorSubject<any> = new BehaviorSubject(this.setRegionTolocalStorage())
  public locationId: BehaviorSubject<any> = new BehaviorSubject(this.getLocationFromlocalStorage() || 0)
  public locationLatitude: BehaviorSubject<string> = new BehaviorSubject(this.getLocationLatitudeFromlocalStorage() || '56.81497464978607')
  public locationLongitude: BehaviorSubject<string> = new BehaviorSubject(this.getLocationLongitudeFromlocalStorage() || '61.32053375244141')
  public radius: BehaviorSubject<string> = new BehaviorSubject(this.getRadiusFromlocalStorage() || '1')
  // public startDate: BehaviorSubject<string> = new BehaviorSubject(this.getStartDateFromlocalStorage() || '')
  // public endDate: BehaviorSubject<string> = new BehaviorSubject(this.getEndDateFromlocalStorage() || '') // Ставим + неделю
  public startDate: BehaviorSubject<string> = new BehaviorSubject(this.nowDate.toISOString())
  public endDate: BehaviorSubject<string> = new BehaviorSubject(this.nowDate.toISOString()) // Ставим + 2 месяцев

  public dateFiltersSelected:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false) 
  
  public eventTypes: BehaviorSubject<Array<number>> = new BehaviorSubject<Array<number>>(this.getEventTypesFromlocalStorage()?.split(',').map(Number).filter(Boolean) || []) 
  public sightTypes: BehaviorSubject<Array<number>> = new BehaviorSubject<Array<number>>(this.getSightTypesFromlocalStorage()?.split(',').map(Number).filter(Boolean) || []) 

  public countFilters: BehaviorSubject<number> = new BehaviorSubject<number>(parseInt(this.getCountFiltersFromlocalStorage() || '0')) 
  //public saveFilters: BehaviorSubject<number> = new BehaviorSubject<number>(parseInt(this.getSaveFiltersFromlocalStorage() || '1')) 
  public changeFilter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false) 
  public changeCityFilter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false) 

  constructor() {}

  // setCityTolocalStorage(city: string = this.city.value ){
  //   localStorage.setItem('city', city)
  //   this.locationId.next(city)
  // }

  // setRegionTolocalStorage(region: string = this.region.value){
  //   localStorage.setItem('region', region)
  //   this.locationId.next(region)
  // }

  setLocationTolocalStorage(locationId: any = this.locationId.value){
    localStorage.setItem('locationId', locationId)
    this.locationId.next(locationId)
  }

  getLocationFromlocalStorage(){
    return localStorage.getItem('locationId')
  }

  // setCircleCenterTolocalStorage(circleCenter:string = this.circleCenter.value){
  //   localStorage.setItem('circleCenter', circleCenter)
  //   this.circleCenter.next(circleCenter)
  // }

  // getCircleCenterFromlocalStorage(){
  //   return localStorage.getItem('circleCenter')
  // }

  setLocationLatitudeTolocalStorage(locationLatitude:string = this.locationLatitude.value){
    localStorage.setItem('locationLatitude', locationLatitude)
    this.locationLatitude.next(locationLatitude)
  }

  getLocationLatitudeFromlocalStorage(){
    return localStorage.getItem('locationLatitude')
  }

  setlocationLongitudeTolocalStorage(locationLongitude:string = this.locationLongitude.value){
    localStorage.setItem('locationLongitude', locationLongitude)
    this.locationLongitude.next(locationLongitude)
  }

  getLocationLongitudeFromlocalStorage(){
    return localStorage.getItem('locationLongitude')
  }

  setRadiusTolocalStorage(radius:string = this.radius.value){
    localStorage.setItem('radius',radius)
    this.radius.next(radius)
  }

  getRadiusFromlocalStorage(){
    return localStorage.getItem('radius')
  }

  setStartDateTolocalStorage(startDate:string = this.startDate.value){
    //localStorage.setItem('startDateFilter',startDate)
    this.startDate.next(startDate)
  }

  // getStartDateFromlocalStorage(){
  //   return localStorage.getItem('startDateFilter')
  // }

  setEndDateTolocalStorage(endDate:string = this.endDate.value){
    //localStorage.setItem('endDateFilter',endDate)
    this.endDate.next(endDate)
  }

  // getEndDateFromlocalStorage(){
  //   return localStorage.getItem('endDateFilter')
  // }

  setEventTypesTolocalStorage(eventTypes:number[] = this.eventTypes.value){
    localStorage.setItem('eventTypesFilter',eventTypes.toString())
    this.eventTypes.next(eventTypes)
  }

  getEventTypesFromlocalStorage(){
    return localStorage.getItem('eventTypesFilter')
  }

  setSightTypesTolocalStorage(sightTypes:number[] = this.sightTypes.value){
    localStorage.setItem('sightTypesFIlter',sightTypes.toString())
    this.sightTypes.next(sightTypes)
  }

  getSightTypesFromlocalStorage(){
    return localStorage.getItem('sightTypesFIlter')
  }

  setCountFiltersTolocalStorage(countFilters:number = this.countFilters.value){
    localStorage.setItem('countFilters',countFilters.toString())
    this.countFilters.next(countFilters)
  }

  getCountFiltersFromlocalStorage(){
    return localStorage.getItem('countFilters')
  }

  // setSaveFiltersTolocalStorage(saveFilters:number = this.saveFilters.value){
  //   localStorage.setItem('saveFilters',saveFilters.toString())
  //   this.saveFilters.next(saveFilters)
  // }

  // getSaveFiltersFromlocalStorage(){
  //   return localStorage.getItem('saveFilters')
  // }

  removeFilters() {
    // localStorage.removeItem('startDateFilter')
    // localStorage.removeItem('endDateFilter')
    // localStorage.removeItem('eventTypesFilter')
    // localStorage.removeItem('sightTypesFIlter')
    // localStorage.removeItem('countFilters')
    this.setStartDateTolocalStorage('')
    this.setEndDateTolocalStorage('')
    this.setEventTypesTolocalStorage([])
    this.setSightTypesTolocalStorage([])
    this.setCountFiltersTolocalStorage(0)
    this.setRadiusTolocalStorage('1')
    this.dateFiltersSelected.next(false)
  }
  // removeDateFilters(){
  //   this.setStartDateTolocalStorage('')
  //   this.setEndDateTolocalStorage('')
  //   localStorage.removeItem('startDateFilter')
  //   localStorage.removeItem('endDateFilter')
  // }
}
