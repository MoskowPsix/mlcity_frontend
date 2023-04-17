import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  public city: BehaviorSubject<string> = new BehaviorSubject(this.getCityFromlocalStorage() || 'Заречный')
  public region: BehaviorSubject<string> = new BehaviorSubject(this.getRegionFromlocalStorage() || 'Свердловская область')
  public cityLatitude: BehaviorSubject<string> = new BehaviorSubject(this.getCityLatitudeFromlocalStorage() || '56.81497464978607')
  public cityLongitude: BehaviorSubject<string> = new BehaviorSubject(this.getCityLongitudeFromlocalStorage() || '61.32053375244141')
  public radius: BehaviorSubject<string> = new BehaviorSubject(this.getRadiusFromlocalStorage() || '1')
  public startDate: BehaviorSubject<string> = new BehaviorSubject(this.getStartDateFromlocalStorage() || '')
  public endDate: BehaviorSubject<string> = new BehaviorSubject(this.getEndDateFromlocalStorage() || '') // Ставим + неделю
  
  public eventTypes: BehaviorSubject<Array<number>> = new BehaviorSubject<Array<number>>(this.getEventTypesFromlocalStorage()?.split(',').map(Number).filter(Boolean) || []) 
  public sightTypes: BehaviorSubject<Array<number>> = new BehaviorSubject<Array<number>>(this.getSightTypesFromlocalStorage()?.split(',').map(Number).filter(Boolean) || []) 

  public countFilters: BehaviorSubject<number> = new BehaviorSubject<number>(parseInt(this.getCountFiltersFromlocalStorage() || '0')) 
  public saveFilters: BehaviorSubject<number> = new BehaviorSubject<number>(parseInt(this.getSaveFiltersFromlocalStorage() || '1')) 
  public changeFilter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false) 
  public changeCityFilter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false) 

  constructor() {}

  queryBuilder(callFromMapPape: false){

  }

  setCityTolocalStorage(city: string = this.city.value){
    localStorage.setItem('city', city)
    this.city.next(city)
  }

  getCityFromlocalStorage(){
    return localStorage.getItem('city')
  }

  setRegionTolocalStorage(region:string =  this.region.value){
    localStorage.setItem('region', region)
    this.region.next(region)
  }

  getRegionFromlocalStorage(){
    return localStorage.getItem('region')
  }

  setCityLatitudeTolocalStorage(cityLatitude:string = this.cityLatitude.value){
    localStorage.setItem('cityLatitude', cityLatitude)
    this.cityLatitude.next(cityLatitude)
  }

  getCityLatitudeFromlocalStorage(){
    return localStorage.getItem('cityLatitude')
  }

  setCityLongitudeTolocalStorage(cityLongitude:string = this.cityLongitude.value){
    localStorage.setItem('cityLongitude', cityLongitude)
    this.cityLongitude.next(cityLongitude)
  }

  getCityLongitudeFromlocalStorage(){
    return localStorage.getItem('cityLongitude')
  }

  setRadiusTolocalStorage(radius:string = this.radius.value){
    localStorage.setItem('radius',radius)
    this.radius.next(radius)
  }

  getRadiusFromlocalStorage(){
    return localStorage.getItem('radius')
  }

  setStartDateTolocalStorage(startDate:string = this.startDate.value){
    localStorage.setItem('startDateFilter',startDate)
    this.startDate.next(startDate)
  }

  getStartDateFromlocalStorage(){
    return localStorage.getItem('startDateFilter')
  }

  setEndDateTolocalStorage(endDate:string = this.endDate.value){
    localStorage.setItem('endDateFilter',endDate)
    this.endDate.next(endDate)
  }

  getEndDateFromlocalStorage(){
    return localStorage.getItem('endDateFilter')
  }

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

  setSaveFiltersTolocalStorage(saveFilters:number = this.saveFilters.value){
    localStorage.setItem('saveFilters',saveFilters.toString())
    this.saveFilters.next(saveFilters)
  }

  getSaveFiltersFromlocalStorage(){
    return localStorage.getItem('saveFilters')
  }

  removeFilters() {
    this.setStartDateTolocalStorage('')
    this.setEndDateTolocalStorage('')
    this.setEventTypesTolocalStorage([])
    this.setSightTypesTolocalStorage([])
    this.setCountFiltersTolocalStorage(0)
    this.setRadiusTolocalStorage('1')
    localStorage.removeItem('startDateFilter')
    localStorage.removeItem('endDateFilter')
    localStorage.removeItem('eventTypesFilter')
    localStorage.removeItem('sightTypesFIlter')
    localStorage.removeItem('countFilters')
  }

  removeDateFilters(){
    this.setStartDateTolocalStorage('')
    this.setEndDateTolocalStorage('')
    localStorage.removeItem('startDateFilter')
    localStorage.removeItem('endDateFilter')
  }
}
