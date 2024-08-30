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
      'latitude',
      'longitude',
    ]

    elementsWhatNeedToCompare.forEach((element: string) => {
      this.compareAndSet(element)
    })

    return {
      id: this.origin.id,
      type: 'Sight',
      history_content: {
        name: this.name,
        description: this.description,
        materials: this.materials,
        sponsor: this.sponsor,
        latitude: this.latitude,
        longitude: this.longitude,
        history_files: this.files,
        history_types: this.types,
      },
  }
}
