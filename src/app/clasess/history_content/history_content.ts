import { IEvent } from 'src/app/models/event'
import { IEventType } from 'src/app/models/event-type'
import { IFile } from 'src/app/models/file'
import { IPrice } from 'src/app/models/price'
import { ISight } from 'src/app/models/sight'
import { ISightType } from 'src/app/models/sight-type'

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
    if (origin === edit) {
      return true
    }
    return false
  }
  /**
   * Получение значения свойства класса по его имени.
   *
   * Принимает в себя имя свойства и отдаёт значение этого свойства
   */
  private getPropertyByName(name: string): any {
    return this[name as keyof HistoryContent]
  }
  /**
   * Присвоения значения по имени свойства класса.
   *
   * Принимает в себя имя свойства класса и значение, которое нужно присвоить свойству.
   */
  private setPropertyByName(name: string, value: any): any {
    return (this[name as keyof HistoryContent] = value)
  }
  /**
   * Присваивает значение свойства объекту, кооторый является свойством класса.
   *
   * Принимает в себя имя свойства класса, ключь объекта свойсьва класса, значение которое нужно устаноить.
   */
  private setPropertyObjectsByName(
    name: string,
    key: string,
    value: any,
  ): void {
    this[name as keyof HistoryContent][key] = value
  }
  /**
   * Получение значения свойства объекта, который является свойством класса.
   *
   * Принимает имя объекста свойства класса и ключь объекта свойства класса.
   */
  private getPropertyObjectsByName(name: string, key: string): any {
    return this[name as keyof HistoryContent][key]
  }
  /**
   * Сравнивает и устанавливает значение свойству класса по имени.
   *
   * Принимает имя свойства класса, который является ещё и ключом объекта свойств класса edited и origin.
   *
   * Сравнивает два значения объектов по одному ключу и если есть различия,
   * то присваивает значения свойству класса с таким же именем как ключ объекта
   */
  private compareAndSetName(name: string): void {
    if (
      this.isDifferentAttributes(
        this.getPropertyObjectsByName('origin', name),
        this.getPropertyObjectsByName('edited', name),
      )
    ) {
      this.setPropertyByName(name, this.edited.name)
    }
  }
}
