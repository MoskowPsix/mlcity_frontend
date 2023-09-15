export interface Location {
    id: number
    name: string
    time_zone: string
    update_at: Date
    created_at: Date
    location_parent?: Location
    locations_children?: Location 
}