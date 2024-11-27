import { IPlace } from 'src/app/models/place'
import { HistoryContent } from './history_content'
import { isEqual } from 'lodash'

interface EditedPlace {
  place_id?: number
  on_delete?: boolean
  address?: string
  latitude?: number
  longitude?: number
  location_id?: number
  history_seances?: EditedSeance[]
}

interface EditedSeance {
  seance_id?: number
  on_delete?: boolean
  date_start?: Date
  date_end?: Date
}

export class EventHistoryContent extends HistoryContent {
  private places: object[] = []
  private date_start!: Date
  private date_end!: Date

  /**
   * Проверка на изменение мест, если места изменелись, они добавляются в массив, измениться они могут следующим образом:
   * - если добавилось что-то новое.
   * - если пришло с пометкой на удаление.
   * - если просто поменялись поля.
   *
   * Внутри так же идет проверка на изменения сеансов почти по той же логике
   */
  private compareAndSetPlaces() {
    let places = JSON.parse(JSON.stringify(this.edited.places.map((place: any) => ({ ...place, place_id: place.id }))))
    if (this.edited.places == null) {
      return
    }
    for (let editedPlace of this.edited.places) {
      // случай на добавление
      if (editedPlace.id == null) {
        this.places.push(editedPlace)
        continue
      }

      // случай на удаление
      if (editedPlace.on_delete != null && editedPlace.on_delete == true) {
        let placeOnDelete = {
          place_id: editedPlace.id,
          on_delete: true,
        }
        this.places.push(placeOnDelete)
        continue
      }
      // случай на изменение
      let originPlace: IPlace | undefined = this.searchOriginPlace(editedPlace.id)
      originPlace ? (editedPlace.id = JSON.parse(JSON.stringify(originPlace.id))) : null
      if (originPlace != undefined && !isEqual(originPlace, editedPlace)) {
        let changedPlace: EditedPlace = {}
        changedPlace.place_id = editedPlace.id

        if (
          originPlace.latitude != editedPlace.latitude ||
          originPlace.longitude != editedPlace.longitude ||
          originPlace.address != editedPlace.address
        ) {
          changedPlace.address = editedPlace.address
          changedPlace.address = editedPlace.address
          changedPlace.latitude = editedPlace.latitude
          changedPlace.longitude = editedPlace.longitude
          changedPlace.location_id = editedPlace.location_id
        }
        this.edited.places.push(changedPlace)

        // Проверяем есть ли измененные сеансы у места, если есть добавляем
        let editedSeances = this.compareAndGetSeances(originPlace.seances, editedPlace.seances)

        if (editedSeances != undefined) {
          changedPlace.history_seances = editedSeances
        }
      }
    }
  }

  /**
    Возвращает массив сеансов, которые были изменены если такие имеются, иначе undefiend.

    @param originalSeances - сеансы, которые были оригинальными
    @param editedSeances - сеансы, которые были в изменены(возможно)

    @returns {EditedSeance[]} массив измененных сеансов либо undefiend
  */
  private compareAndGetSeances(originalSeances: any, editedSeances: any): EditedSeance[] | undefined {
    if (!isEqual(originalSeances, editedSeances)) {
      let seances: EditedSeance[] = []

      for (let editedSeance of editedSeances) {
        // если новый сеанс, добавляем просто сразу в массив
        if (editedSeance.id == null) {
          seances.push(editedSeance)
          continue
        }

        // Если сеанс на удаление, создаем обьект нужной структуры и добавляем в массив
        if (editedSeance.on_delete != null && editedSeance.on_delete) {
          let changedSeance: EditedSeance = {}
          changedSeance.seance_id = editedSeance.id
          changedSeance.on_delete = editedSeance.on_delete
          seances.push(changedSeance)
          continue
        }

        // если сеанс на изменение, создаем обьект нужной структуры и добавляем в массив
        let originSeance: any = this.searchOriginSeance(originalSeances, editedSeance.id)
        if (originSeance != undefined && !isEqual(originSeance, editedSeance)) {
          let changedSeance: EditedSeance = {}
          changedSeance.seance_id = editedSeance.id

          if (originSeance.date_start != editedSeance.date_start) {
            changedSeance.date_start = editedSeance.date_start
          }
          if (originSeance.date_end != editedSeance.date_end) {
            changedSeance.date_end = editedSeance.date_end
          }

          seances.push(changedSeance)
        }
      }

      return seances
    }

    return undefined
  }

  /**
   * по id измененного сеанса ищет оригинальный сеанс
   * @param seances массив оригинальных
   * @param seanceId id измененного
   * @returns возвращает сеанс если он находится, иначе undefiend
   */
  private searchOriginSeance(seances: any, seanceId: number): any | undefined {
    for (let seance of seances) {
      if (seance.id == seanceId) {
        return seance
      }
    }

    return undefined
  }

  /**
   * по id измененного места ищет оригинальный
   * @param seances массив оригинальных
   * @param seanceId id измененного
   * @returns возвращает место если оно находится, иначе undefiend
   */
  private searchOriginPlace(placeId: number): IPlace | undefined {
    for (let element of this.origin.places)
      if (element.id == placeId) {
        return element
      }

    return undefined
  }

  public merge(origin: any, edited: any) {
    this.origin = origin
    this.edited = edited
    let elementsWhatNeedToCompare = [
      'name',
      'description',
      'materials',
      'sponsor',
      'date_start',
      'age_limit',
      'date_end',
      'types',
      'files',
    ]
    elementsWhatNeedToCompare.forEach((element: string) => {
      this.compareAndSet(element)
    })
    this.compareAndSetPlaces()
    this.compareAndSetPrices()
    return {
      id: this.origin.id,
      type: 'Event',
      history_content: {
        name: this.name,
        description: this.description,
        materials: this.materials,
        sponsor: this.sponsor,
        date_start: this.date_start,
        age_limit: this.age_limit,
        date_end: this.date_end,
        history_files: this.files,
        history_types: this.types,
        history_prices: this.price,
        history_places: this.places,
      },
    }
  }
}
