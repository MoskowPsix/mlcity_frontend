import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],

})
export class AboutComponent implements OnInit {

  scrolledPixels: number = 0
  scrollThreshold: number = 200
  isScrolled: boolean = false
  userScroll:number = 0



  @HostListener('window:scroll', ['$event'])
  myScroll(event: Event) {
    console.log(1)
  }
  



  constructor() { }

  ngOnInit() {
    // window.addEventListener('scroll', , true);
  }


  scrollEvent = (): void => {
    let viewElement: boolean = false

  
  }

  



}

