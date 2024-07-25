import { IPlace } from 'src/app/models/place'
import { HistoryContent } from './history_content'

export class EventHistoryContent extends HistoryContent {
  places!: object[]
  date_start!: Date
  date_end!: Date

  compareAndSetDateStart() {
    if (this.compareAttributes(this.origin.date_start, this.origin.date_start)) {
      this.date_start = this.edited.date_start
    }
  }

  compareAndSetDateEnd() {
    if (this.compareAttributes(this.origin.date_end, this.origin.date_end)) {
      this.date_end = this.edited.date_end
    }
  }

  compareAndSetPlaces() {
    for (let place of this.edited.places) {
      // случай на добавление
      if (place.id == null) {
        this.places.push(place)
        continue
      }

      // случай на удаление
      if (place.on_delete != null && place.on_delete == true) {
        let placeOnDelete = {
          id: place.id,
          on_delete: true,
        }
        this.places.push(placeOnDelete)
        continue
      }

      // случай на изменение

    }
  }

  searchOriginPlace
}
