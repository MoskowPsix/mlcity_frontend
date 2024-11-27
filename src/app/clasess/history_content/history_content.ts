import { IEvent } from 'src/app/models/event'
import { IEventType } from 'src/app/models/event-type'
import { IFile } from 'src/app/models/file'
import { IPrice } from 'src/app/models/price'
import { ISight } from 'src/app/models/sight'
import { ISightType } from 'src/app/models/sight-type'
import { isEqual } from 'lodash'

interface EditedPrice {
  price_id: number
  cost_rub?: string
  descriptions?: string
}

interface EditedFile {
  event_id: number
  name?: string
  link?: string
  local?: number
  file_types?: object
}
export class HistoryContent {
  public origin: any = {}
  public edited: any = {}
  protected name!: string
  protected description!: string
  protected materials!: string
  protected sponsor!: string
  protected address!: string
  protected age_limit!: number
  protected files: object[] = []
  protected types: ISightType[] | IEventType[] = []
  protected price: object[] = []

  /**
   * @param origin any оригинальный объект событий или мест
   * @param edit any изменённый объект событй или мест
   * @return boolen
   *
   * Сравнивает два входных значения и при совпадении возвращает true, напротив же false.
   */
  protected isDifferentAttributes(origin: any, edit: any): boolean {
    return !isEqual(origin, edit)
  }

  /**
   * @param name string имя свойства класса
   * @return any значение свойства класса
   *
   * Получение значения свойства класса по его имени.
   *
   * Принимает в себя имя свойства и отдаёт значение этого свойства
   */
  protected getProperty(name: string): any {
    return this[name as keyof HistoryContent]
  }

  /**
   * @param name string имя свойства класса
   * @param value any значение которое присваевается свойству класса
   * @return void
   *
   * Присвоения значения по имени свойства класса.
   *
   * Принимает в себя имя свойства класса и значение, которое нужно присвоить свойству.
   */
  protected setProperty(name: string, value: any): void {
    this[name as keyof HistoryContent] = value
  }

  /**
   * @param name string имя свойства класса, которое является массивом
   * @param value any значение, которое добавляется в массив
   * @return void
   *
   * Добавляет значение в массив по имени свойства класса.
   *
   * Принимает в себя имя свойства класса и значение, которое нужно добавить в массив.
   */
  protected setPropertyForArrayPush(name: string, value: any): void {
    this[name as keyof HistoryContent].push(value)
  }

  /**
   * @param name string - имя свойства класса, которое является объектом
   * @param key string - ключ объекта свойства класса
   * @param value any - значение присваемового свойству объекта свойства класса
   * @return void
   *
   * Присваивает значение свойства объекту, который является свойством класса.
   *
   * Принимает в себя имя свойства класса, ключь объекта свойсьва класса, значение которое нужно устаноить.
   */
  protected setPropertyObjects(name: string, key: string, value: any): void {
    this[name as keyof HistoryContent][key] = value
  }

  /**
   * @param name string имя объекта свойства класса
   * @param key string ключ массива объекта свойства класса
   * @param value any значение добавляемое в массив объекта свойства класса
   * @return void
   *
   * Добавляет значение в массив свойства объекта, который является свойством класса.
   *
   * Принимает в себя имя свойства класса, ключь объекта свойсьва класса, значение которое нужно добавить в массив.
   */
  protected setPropertyObjectsForArrayPush(name: string, key: string, value: any): void {
    this[name as keyof HistoryContent][key].push(value)
  }

  /**
   * @param name string имя массова свойства объекта класса
   * @param key string ключ массива свойства объекта класса
   * @return void
   *
   * Получение значения свойства объекта, который является свойством класса.
   *
   * Принимает имя объекста свойства класса и ключь объекта свойства класса.
   */
  protected getPropertyObjects(name: string, key: string): any {
    return this[name as keyof HistoryContent][key]
  }

  /**
   * @param name string имя свойства класса
   * @return void
   *
   * Находит и определяет тип свойства класса для понимания как с ним обращаться, как со строкой или как с массивом.
   *
   * Входное значение имя свойства.
   */
  protected compareAndSet(name: string): void {
    const property: any = this.getProperty(name)
    typeof property === typeof [] ? this.compareAndSetArray(name) : this.compareAndSetString(name)
  }

  /**
   * @param name string имя свойства класса
   * @return void
   *
   * Сравнивает и устанавливает значение свойству класса по имени.
   *
   * Принимает имя свойства класса, который является ещё и ключом объекта свойств класса edited и origin.
   *
   * Сравнивает два строковых значения объектов по одному ключу и если есть различия,
   * то присваивает значения свойству класса с таким же именем как ключ объекта
   */
  protected compareAndSetString(name: string): void {
    if (this.isDifferentAttributes(this.getPropertyObjects('origin', name), this.getPropertyObjects('edited', name))) {
      this.setProperty(name, this.getPropertyObjects('edited', name))
    }
  }

  /**
   * @param name string имя свойства класса
   * @return void
   *
   * Сравнивает и добавляет значение в массив свойству класса по имени.
   *
   * Принимает имя свойства класса, который является ещё и ключом объекта свойств класса edited и origin.
   *
   * Сравнивает два массива объектов и если есть различия,
   * то добавляет в массив значения свойству класса.
   */
  private compareAndSetArray(name: string): void {
    const origin: any[] = this.getPropertyObjects('origin', name)
    const edited: any[] = this.getPropertyObjects('edited', name)

    edited.forEach((edit) => {
      const orig = origin.find((o: any) => o.id === edit.id)
      if (!isEqual(this.delArrayInObject(edit), this.delArrayInObject(orig)) || !edit) {
        this.setPropertyForArrayPush(name, this.delArrayInObject(edit))
      }
    })
  }

  /**
   *
   * @param obj object объект который нужно отчистить от массивов
   * @returns void
   *
   * Очищаем объект от массивов
   */
  private delArrayInObject(obj: any): void {
    if (obj === 'object') {
      const result: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (!(Array.isArray(obj[key]) || typeof obj[key] === 'object')) {
            result[key] = obj[key]
          }
        }
      }

      return result
    } else {
      return obj
    }
  }

  protected compareAndSetPrices(): void {
    // Если нет цен, то выходим
    if (this.edited.price == null) {
      return
    }
    // Перебираем цены
    for (let editedPrice of this.edited.price) {
      // Если новая цена, добавляем просто сразу в массив
      if (editedPrice.id == null) {
        this.price.push(editedPrice)

        return
      }
      // Если цена удалена, добавляем её в массив с флагом удаления
      if (editedPrice.on_delete != null && editedPrice.on_delete) {
        let priceOnDelete = {
          price_id: editedPrice.id,
          on_delete: true,
        }
        this.price.push(priceOnDelete)

        return
      }

      let originalPrice = this.SearchOriginalPrice(editedPrice.id)
      // Если цена изменена, добавляем её в массив с изменением цены
      if (originalPrice != undefined && !isEqual(editedPrice, originalPrice)) {
        let changedPrice: EditedPrice = {
          price_id: editedPrice.id,
        }

        if (!isEqual(editedPrice.cost_rub, originalPrice.cost_rub)) {
          changedPrice.cost_rub = editedPrice.cost_rub
        }

        if (!isEqual(editedPrice.descriptions, originalPrice.descriptions)) {
          changedPrice.descriptions = editedPrice.descriptions
        }

        this.price.push(changedPrice)
      }
    }
  }
  private SearchOriginalFile(fileId: number) {
    for (let element of this.origin.files)
      if (element.id == fileId) {
        return element
      }

    return undefined
  }
  private SearchOriginalPrice(priceId: number) {
    for (let element of this.origin.price)
      if (element.id == priceId) {
        return element
      }

    return undefined
  }
}
