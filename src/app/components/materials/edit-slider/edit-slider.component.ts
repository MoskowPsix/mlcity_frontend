import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { ToastService } from 'src/app/services/toast.service'
import { FileService } from 'src/app/services/file.service'
@Component({
  selector: 'app-edit-slider',
  templateUrl: './edit-slider.component.html',
  styleUrls: ['./edit-slider.component.scss'],
})
export class EditSliderComponent implements OnInit {
  constructor(
    private toastService: ToastService,
    private fileService: FileService,
  ) {}
  @Input() files: any[] = []
  @ViewChild('mainPhoto') mainPhoto!: any
  @Output() filesEmit: EventEmitter<any> = new EventEmitter<any>()
  @Output() deleteVkfilesEmit: EventEmitter<any> = new EventEmitter<any>()
  @Input() type: string = ''
  @Input() vkFiles: any[] = []
  previews: any[] = []
  deleteFiles: any[] = []

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vkFiles']) {
      for (let i = 0; i < this.previews.length; i++) {
        if (this.previews[i].vk) {
          console.log(this.previews[i].vk)
          this.previews.splice(i, 1)
        }
      }
      this.previews.forEach((file: any, i: number) => {})
      this.previews.push(...this.vkFiles)
    }
  }
  deleteVkFiles(file: any) {
    this.deleteVkfilesEmit.emit(file)
  }
  fileChanged(event: any, inputBlock: any) {
    // Преобразуем FileList в обычный массив
    let filesArray: File[] = Array.from(event.target.files)

    // Создаем массив промисов
    let promises = filesArray.map((file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e: any) => {
          if (this.files.map((e) => e.name).indexOf(file.name) === -1) {
            this.previews.push({
              link: e.target.result,
              name: file.name,
            })

            this.files.push(file)
            console.log('load')
          } else {
            this.toastService.showToast('Файл уже загружен!', 'warning')
          }
          resolve()
        }
        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsDataURL(file)
      })
    })

    // Дожидаемся завершения всех промисов
    Promise.all(promises)
      .then(() => {
        event.target.value = null
        this.filesEmit.emit(this.files)
        console.log('emit')
      })
      .catch((error) => {
        console.error('Error reading files', error)
      })
  }

  setMainPhoto(event: any) {
    if (event.target.style.backgroundImage) {
      this.mainPhoto.nativeElement.style.backgroundImage = event.target.style.backgroundImage
    }
  }

  deletePreview(file: any, i: number) {
    if (file.id) {
      let index = this.files.map((e) => e.id).indexOf(file.id)
      this.files[index].on_delete = true
      this.filesEmit.emit(this.files)
      this.previews.splice(index, 1)
    } else {
      let index = this.files.map((e) => e.name).indexOf(file.name)
      let previewsIndex = this.previews.map((e) => e.name).indexOf(file.name)
      if (this.previews[previewsIndex].vk) {
        this.deleteVkFiles(file)
        this.previews.splice(i, 1)
      } else {
        this.files.splice(index, 1)
        this.previews.splice(i, 1)
      }

      this.filesEmit.emit(this.files)
    }
  }

  ngOnInit() {
    if (this.files) {
      this.files.forEach((file) => {
        let link = this.fileService.checkLinkFile(file)
        if (link !== '') this.previews.push({ id: file.id, link: link, name: file.name })
      })
    }
  }
}
