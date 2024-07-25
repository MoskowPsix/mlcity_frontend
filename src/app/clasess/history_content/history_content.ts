import { IEvent } from 'src/app/models/event'
import { IEventType } from 'src/app/models/event-type'
import { IFile } from 'src/app/models/file'
import { IPrice } from 'src/app/models/price'
import { ISight } from 'src/app/models/sight'
import { ISightType } from 'src/app/models/sight-type'
import { isEqual } from 'lodash'

export class HistoryContent {
  public origin: any = {}
  public edited: any = {}
  private name!: string
  private description!: string
  private materials!: string
  private sponsor!: string
  private files!: IFile[]
  private types!: ISightType[] | IEventType[]
  private prices!: IPrice[]
  /**
   * Сравнивает два входных значения и при совпадении возвращает true, напротив же false.
   */
  private isDifferentAttributes(origin: any, edit: any): boolean {
    if (isEqual(origin, edit)) {
      return true
    }
    return false
  }
  /**
   * Получение значения свойства класса по его имени.
   *
   * Принимает в себя имя свойства и отдаёт значение этого свойства
   */
  private getProperty(name: string): any {
    return this[name as keyof HistoryContent]
  }
  /**
   * Присвоения значения по имени свойства класса.
   *
   * Принимает в себя имя свойства класса и значение, которое нужно присвоить свойству.
   */
  private setProperty(name: string, value: any): void {
    this[name as keyof HistoryContent] = value
  }
  /**
   * Добавляет значение в массив по имени свойства класса.
   *
   * Принимает в себя имя свойства класса и значение, которое нужно добавить в массив.
   */
  private setPropertyForArrayPush(name: string, value: any): void {
    this[name as keyof HistoryContent].push(value)
  }
  /**
   * Присваивает значение свойства объекту, который является свойством класса.
   *
   * Принимает в себя имя свойства класса, ключь объекта свойсьва класса, значение которое нужно устаноить.
   */
  private setPropertyObjects(name: string, key: string, value: any): void {
    this[name as keyof HistoryContent][key] = value
  }
  /**
   * Добавляет значение в массив свойства объекта, который является свойством класса.
   *
   * Принимает в себя имя свойства класса, ключь объекта свойсьва класса, значение которое нужно добавить в массив.
   */
  private setPropertyObjectsForArrayPush(
    name: string,
    key: string,
    value: any,
  ): void {
    this[name as keyof HistoryContent][key].push(value)
  }
  /**
   * Получение значения свойства объекта, который является свойством класса.
   *
   * Принимает имя объекста свойства класса и ключь объекта свойства класса.
   */
  private getPropertyObjects(name: string, key: string): any {
    return this[name as keyof HistoryContent][key]
  }
  /**
   * Находит и определяет тип свойства класса для понимания как с ним обращаться, как со строкой или как с массивом.
   *
   * Входное значение имя свойства.
   */
  compareAndSet(name: string): void {
    const property: any = this.getProperty(name)
    typeof property === typeof []
      ? this.compareAndSetArray(name)
      : this.compareAndSetString(name)
  }
  /**
   * Сравнивает и устанавливает значение свойству класса по имени.
   *
   * Принимает имя свойства класса, который является ещё и ключом объекта свойств класса edited и origin.
   *
   * Сравнивает два строковых значения объектов по одному ключу и если есть различия,
   * то присваивает значения свойству класса с таким же именем как ключ объекта
   */
  private compareAndSetString(name: string): void {
    if (
      this.isDifferentAttributes(
        this.getPropertyObjects('origin', name),
        this.getPropertyObjects('edited', name),
      )
    ) {
      this.setProperty(name, this.edited.name)
    }
  }
  /**
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
      if (!isEqual(edit, orig)) {
        this.setPropertyForArrayPush(name, edit)
      }
    })
  }
}
