import { Component, HostListener, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  scrolledPixels: number = 0
  scrollThreshold: number = 200
  isScrolled: boolean = false
  userScroll: number = 0

  @HostListener('window:scroll', ['$event'])
  myScroll(event: Event) {}

  constructor(
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('О проекте Мой Маленький Город')
    this.metaService.updateTag({
      name: 'description',
      content:
        'Наша команда делает приложение для жителей малых городов и поселков.',
    })
  }

  scrollEvent = (): void => {
    let viewElement: boolean = false
  }
}
