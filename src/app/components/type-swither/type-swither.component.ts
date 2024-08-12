import { animate, keyframes, state, style, transition, trigger } from '@angular/animations'
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { Console } from 'console'
import { Subject, takeUntil } from 'rxjs'
import { SwitchTypeService } from 'src/app/services/switch-type.service'

@Component({
  selector: 'app-type-swither',
  templateUrl: './type-swither.component.html',
  styleUrls: ['./type-swither.component.scss'],
})
export class TypeSwitherComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(private switchTypeService: SwitchTypeService) {}
  type: string = ''
  sight: string = 'sights'
  event: string = 'events'
  @Input() redirect!: boolean
  @Output() endingSwitchAnimation: EventEmitter<any> = new EventEmitter()
  @ViewChild('switcher') switcher!: ElementRef<HTMLElement>
  @ViewChild('itemFirstText') itemFirstText!: ElementRef<HTMLElement>
  @ViewChild('itemFirstImg') itemFirstImg!: ElementRef<HTMLElement>
  @ViewChild('itemSecond') itemSecond!: ElementRef<HTMLElement>
  @ViewChild('itemSecondImg') itemSecondImg!: ElementRef<HTMLElement>
  @ViewChild('itemSecondText') itemSecondText!: ElementRef<HTMLElement>

  render(
    switcher: HTMLElement,
    itemFirstText: HTMLElement,
    itemFirstImg: HTMLElement,
    itemSecond: HTMLElement,
    itemSecondImg: HTMLElement,
    itemSecondText: HTMLElement,
  ) {
    console.log('render')
    if (this.type === this.event) {
      switcher.style.width = '7rem'
      itemFirstText.style.opacity = '0'
      itemFirstText.style.transform = 'translate(5rem)'
      itemFirstImg.classList.add('fire_non-active')
      itemSecond.style.transform = 'translate(-3.5rem)'
      itemSecondImg.classList.add('flag_active')
      itemSecondText.style.opacity = '1'
    } else {
      itemSecondText.style.opacity = '0'
      switcher.style.width = '8rem'
      itemFirstImg.classList.remove('fire_non-active')
      itemSecond.style.transform = 'translate(0rem)'
      itemFirstText.style.opacity = '1'

      setTimeout(() => {
        itemFirstText.style.transform = 'translate(0rem)'
      }, 100)

      itemSecondImg.classList.remove('flag_active')
    }
  }
  switchType(
    switcher: HTMLElement,
    itemFirstText: HTMLElement,
    itemFirstImg: HTMLElement,
    itemSecond: HTMLElement,
    itemSecondImg: HTMLElement,
    itemSecondText: HTMLElement,
  ) {
    this.render(switcher, itemFirstText, itemFirstImg, itemSecond, itemSecondImg, itemSecondText)
    this.switchTypeService.changeType()
    console.log(this.switchTypeService.currentType.value)
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.render(
      this.switcher.nativeElement,
      this.itemFirstText.nativeElement,
      this.itemFirstImg.nativeElement,
      this.itemSecond.nativeElement,
      this.itemSecondImg.nativeElement,
      this.itemSecondText.nativeElement,
    )
  }
  ngOnDestroy(): void {
    
  }
  ngOnInit() {
    this.switchTypeService.currentType.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.type = value
    })
  }
}
