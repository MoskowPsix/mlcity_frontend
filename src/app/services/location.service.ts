import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { Location } from '@angular/common'

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getLocationsAll() {
    //Получаем все города и регионы
    return this.http.get<Location[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/locations`,
    )
  }

  //test

  getLocationsIds(id: number) {
    //Получаем регио или город по id
    return this.http.get<any>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/location/${id}`,
    )
  }

  getLocationsName(name: string) {
    //Получаем по имени город или регион
    return this.http.get<Location[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/location/name/${name}`,
    )
  }

  getLocationsWithRegion(name: string, parentName: string) {
    //Получаем по имени город или регион
    const params = {
      name: name,
      parentName: parentName,
    }
    return this.http.get<Location[]>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/locationWithRegion`,
      { params: { ...params } },
    )
  }
  getLocationByCoords(coords: number[]) {
    const params = {
      latitude: coords[0],
      longitude: coords[1],
    }
    return this.http.get<Location>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/locations/search/coords`,
      { params: { ...params } },
    )
  }
}
