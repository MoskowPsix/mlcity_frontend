import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  //Определение геопозиции
  geolocationMap(event: YaReadyEvent<ymaps.Map>): void{
    ymaps.geolocation
    .get({
      provider: 'browser',
      mapStateAutoApply: true,
    })
    .then((result) => {
      result.geoObjects.options.set('visible', false);
      event.target.geoObjects.add(result.geoObjects);
    });
  }










}
