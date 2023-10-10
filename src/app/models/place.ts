export interface IPlace {
    id:number
    event_id: number
    sight_id?: number
    location_id: number
    latitude: number
    longitude: number
    address: string
    event: any[]
    seances: any
}
