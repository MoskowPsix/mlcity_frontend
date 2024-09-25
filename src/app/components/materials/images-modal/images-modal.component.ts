import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-images-modal',
  templateUrl: './images-modal.component.html',
  styleUrls: ['./images-modal.component.scss'],
})
export class ImagesModalComponent implements OnInit {
  @Input() imagesPathArray:any = []
  @Output() closeModalEmit:EventEmitter<any> = new EventEmitter()
  @Input() openModal!:boolean
  sanitizer: DomSanitizer = inject(DomSanitizer)
  swiperIndex:number = 1

  constructor() { }
  closeModal(){
    this.closeModalEmit.emit()
  }
  checkUrl(file: any) {
    return file.link.includes('https') || file.link.includes('http')
      ? file.link
      : environment.BACKEND_URL + ':' + environment.BACKEND_PORT + file.link
  }
  iframeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
  slideChange(event:any){
    this.swiperIndex = event.detail[0].activeIndex + 1
  }
  ngOnInit() {}
}
