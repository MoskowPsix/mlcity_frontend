import { HistoryContent } from './history_content'

export class SightHistoryContent extends HistoryContent {
  private latitude!: number
  private longitude!: number

  public merge(orig: any, edited: any) {
    this.origin = orig
    this.edited = edited

    let elementsWhatNeedToCompare = [
      'name',
      'description',
      'materials',
      'sponsor',
      'files',
      'types',
      'prices',
      'latitude',
      'longitude',
    ]
    elementsWhatNeedToCompare.forEach((element: string) => {
      this.compareAndSet(element)
    })
  }
}
