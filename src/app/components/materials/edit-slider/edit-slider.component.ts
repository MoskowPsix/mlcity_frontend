import { Component, Input, OnInit, ViewChild } from '@angular/core'

@Component({
  selector: 'app-edit-slider',
  templateUrl: './edit-slider.component.html',
  styleUrls: ['./edit-slider.component.scss'],
})
export class EditSliderComponent implements OnInit {
  constructor() {}
  @Input() images: string[] = [
    '/assets/images/background-deloevents.jpg',
    '/assets/images/0017387_0.jpeg',
    '/assets/images/delovye-meropriyatiya-3.jpg',
  ]
  @ViewChild('mainPhoto') mainPhoto!: any

  setMainPhoto(event: any) {
    if (event.target.style.backgroundImage) {
      this.mainPhoto.nativeElement.style.backgroundImage =
        event.target.style.backgroundImage
    }
  }
  ngOnInit() {}
}
