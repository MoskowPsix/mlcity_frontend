import { Component, inject, Input, OnInit } from '@angular/core'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { IonicSlides } from '@ionic/angular'
import { register } from 'swiper/element/bundle'
import { environment } from 'src/environments/environment'
import { DomSanitizer } from '@angular/platform-browser'

register()
@Component({
  selector: 'app-show-slider',
  templateUrl: './show-slider.component.html',
  styleUrls: ['./show-slider.component.scss'],
})
export class ShowSliderComponent implements OnInit {
  constructor() {}
  @Input() files?: any[]
  swiperModules = [IonicSlides]
  sanitizer: DomSanitizer = inject(DomSanitizer)

  checkUrl(file: any) {
    console.log(file)
    return file.link.includes('https') || file.link.includes('http')
      ? file.link
      : environment.BACKEND_URL + ':' + environment.BACKEND_PORT + file.link
  }
  iframeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  ngOnInit() {}
}
