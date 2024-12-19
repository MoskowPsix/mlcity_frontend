import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'

@Component({
  selector: 'app-about-slider',
  templateUrl: './about-slider.component.html',
  styleUrls: ['./about-slider.component.scss'],
})
export class AboutSliderComponent implements OnInit {
  @Input() aboutModal: boolean = true
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @ViewChild('swiper') swiper!: any
  swiperItemsArray: any[] = [
    {
      image: '/assets/images/Ресурс 17.png',
      header: 'Смотри что происходит ВОКРУГ тебя!',
      description: 'Используй карту! Быстро находи что происходит здесь и сейчас!',
      background: 'linear-gradient(180deg, rgba(255,192,0,1) 0%, rgba(255,101,0,1) 100%);',
      backgroundColor: 'rgb(255,192,0);',
    },
    {
      image: '/assets/images/Ресурс 18.png',
      header: 'Узнай кто придет вместе с тобой!',
      description: 'Используй карту! Быстро находи что происходит здесь и сейчас!',
      background: 'linear-gradient(180deg, rgba(140,198,63,1) 0%, rgba(0,146,69,1) 100%)',
    },
    {
      image: '/assets/images/Ресурс 19.png',
      header: 'Создай свое событие!',
      description: 'ВОКРУГ тишина? Заяви о себе!',
      background: 'linear-gradient(180deg, rgba(193,39,143,1) 0%, rgba(102,45,145,1) 100%);',
    },
  ]

  swiperIndex: number = 1
  constructor() {}
  aboutModalslideChange(event: any) {
    this.swiperIndex = event.detail[0].activeIndex + 1
  }
  aboutModalNextslide() {
    this.swiper.nativeElement.swiper.slideNext()
  }
  closeAboutModal() {
    this.closeModal.emit()
  }
  ngOnInit() {}
}
