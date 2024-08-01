import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { ToastService } from 'src/app/services/toast.service'
@Component({
  selector: 'app-edit-slider',
  templateUrl: './edit-slider.component.html',
  styleUrls: ['./edit-slider.component.scss'],
})
export class EditSliderComponent implements OnInit {
  constructor(
    private toastService: ToastService
  ) {}
  @Input() files: any[] = []
  @ViewChild('mainPhoto') mainPhoto!: any
  @Output() filesEmit: EventEmitter<any> = new EventEmitter<any>()
  previews: any[] = []
  deleteFiles: any[] = []

  fileChanged(event: any, inputBlock: any) {
    console.log(event)
    // Преобразуем FileList в обычный массив
    let filesArray: File[] = Array.from(event.target.files)
    filesArray.forEach((file: File) => {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        if (this.files.map((e) => e.name).indexOf(file.name) == -1) {
          this.previews.push({
            link: e.target.result,
            name: file.name,
          })
          this.files.push(file)
        } else {
          this.toastService.showToast('Файл уже загружен!', 'warning')
        }
      }
      reader.readAsDataURL(file)
    })
    event.target.value = null
    this.filesEmit.emit(this.files)
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
      let index = this.files.map((e) => e.id).indexOf(file.name)
      this.files.splice(index, 1)
      this.previews.splice(i, 1)
      this.filesEmit.emit(this.files)
    }
  }
  ngOnInit() {
    this.files.forEach((file) => {
      this.previews.push({ id: file.id, link: file.link, name: file.name })
    })
  }
}