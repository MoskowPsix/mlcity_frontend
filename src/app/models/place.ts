export interface IPlace {
  id: number
  place_id?: number
  event_id: number
  sight_id?: number
  location_id: number
  location?:any[]
  latitude: number
  longitude: number
  address: string
  event: any[]
  seances: any[]
}
