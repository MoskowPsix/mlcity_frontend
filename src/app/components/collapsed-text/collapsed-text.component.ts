import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core'

@Component({
  selector: 'app-collapsed-text',
  templateUrl: './collapsed-text.component.html',
  styleUrls: ['./collapsed-text.component.scss'],
})
export class CollapsedTextComponent implements OnInit, AfterViewInit {
  textOpen: boolean = true
  textClass: string = ''
  disButton: boolean = false
  @ViewChild('contentDescription') contentDescription!: ElementRef
  constructor() {}

  textOpenVariable() {
    this.textOpen = !this.textOpen

    if (this.textOpen) {
      this.textClass = 'main-conteiner'
    } else {
      this.textClass = 'main-conteiner_collapsed'
    }
  }

  ionViewDidEnter(): void {
    console.log(this.contentDescription)
  }

  ngAfterViewInit(): void {
    this.contentDescription?.nativeElement?.offsetHeight < 74 ? (this.disButton = false) : (this.disButton = true)
  }

  ngOnInit() {
    this.textOpenVariable()
  }
}
