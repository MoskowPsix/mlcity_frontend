import { IPlace } from 'src/app/models/place'
import { HistoryContent } from './history_content'
import { isEqual } from 'lodash'

interface EditedPlace {
  place_id?: number
  on_delete?: boolean
  address?: string
  latitude?: number
  longitude?: number
  history_seances?: EditedSeance[]
}

interface EditedSeance {
  seance_id?: number
  on_delete?: boolean
  date_start?: Date
  date_end?: Date
}

export class EventHistoryContent extends HistoryContent {
  places!: object[]
  date_start!: Date
  date_end!: Date

  compareAndSetDateStart() {
    if (
      this.isDifferentAttributes(this.origin.date_start, this.origin.date_start)
    ) {
      this.date_start = this.edited.date_start
    }
  }

  compareAndSetDateEnd() {
    if (
      this.isDifferentAttributes(this.origin.date_end, this.origin.date_end)
    ) {
      this.date_end = this.edited.date_end
    }
  }

  /**
   * Проверка на изменение мест, если места изменелись, они добавляются в массив, измениться они могут следующим образом:
   * - если добавилось что-то новое.
   * - если пришло с пометкой на удаление.
   * - если просто поменялись поля.
   *
   * Внутри так же идет проверка на изменения сеансов почти по той же логике
   */
  compareAndSetPlaces() {
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
      let originPlace: IPlace | undefined = this.searchOriginPlace(
        editedPlace.id,
      )
      if (originPlace != undefined && !isEqual(originPlace, editedPlace)) {
        let editedPlace: EditedPlace = {}
        editedPlace.place_id = editedPlace.place_id

        if (originPlace.address != editedPlace.address) {
          editedPlace.address = editedPlace.address
        }

        if (originPlace.latitude != editedPlace.latitude) {
          editedPlace.latitude = editedPlace.latitude
        }

        if (originPlace.longitude != editedPlace.longitude) {
          editedPlace.longitude = editedPlace.longitude
        }

        // Проверяем есть ли измененные сеансы у места, если есть добавляем
        let editedSeances = this.compareAndGetSeances(
          originPlace.seances,
          editedPlace.history_seances,
        )

        if (editedSeances != undefined) {
          editedPlace.history_seances = editedSeances
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
  compareAndGetSeances(
    originalSeances: any,
    editedSeances: any,
  ): EditedSeance[] | undefined {
    if (!isEqual(originalSeances, editedSeances)) {
      let seances: EditedSeance[] = []

      for (let editedSeance of editedSeances) {
        // если новый сеанс, добавляем просто сразу в массив
        if (editedSeance.id == null) {
          seances.push(editedSeance)
          continue
        }

        // Если сеанс на удаление, создаем обьект нужной структуры и добавляем в массив
        if (editedSeance.on_delete != null && editedSeance.on_delete == true) {
          let editedSeance: EditedSeance = {}
          editedSeance.seance_id = editedSeance.seance_id
          editedSeance.on_delete = editedSeance.on_delete
          seances.push(editedSeance)
          continue
        }

        // если сеанс на изменение, создаем обьект нужной структуры и добавляем в массив
        let originSeance: any = this.searchOriginSeance(
          originalSeances,
          editedSeance.id,
        )
        if (originSeance != undefined && !isEqual(originSeance, editedSeance)) {
          let editedSeance: EditedSeance = {}
          editedSeance.seance_id = editedSeance.seance_id

          if (originSeance.date_start != editedSeance.date_start) {
            editedSeance.date_start = editedSeance.date_start
          }
          if (originSeance.date_end != editedSeance.date_end) {
            editedSeance.date_end = editedSeance.date_end
          }

          seances.push(editedSeance)
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
  searchOriginSeance(seances: any, seanceId: number): any | undefined {
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
  searchOriginPlace(placeId: number): IPlace | undefined {
    for (let element of this.origin.places)
      if (element.id == placeId) {
        return element
      }

    return undefined
  }
}
