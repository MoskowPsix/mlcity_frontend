import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { Subject, takeUntil } from 'rxjs'
import { SwitchTypeService } from 'src/app/services/switch-type.service'

@Component({
  selector: 'app-type-swither',
  templateUrl: './type-swither.component.html',
  styleUrls: ['./type-swither.component.scss'],
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
      state('closed', style({
        height: '100px',
        opacity: 0.8,
        backgroundColor: 'blue'
      })),
      transition('* => closed', [
        animate('1s')
      ]),
      transition('* => open', [
        animate('0.5s')
      ]),
    ]),
  ]
})
export class TypeSwitherComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(
    private swithTypeService: SwitchTypeService
  ) { }
  type: string = ''
  sight: string = 'sights'
  event: string = 'events'


  swithType() {
    this.swithTypeService.changeType()
  }
  ngOnInit() { 
    this.swithTypeService.currentType.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.type = value
    })
  }

}
