import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { Subject, takeUntil } from 'rxjs'
import { SwitchTypeService } from 'src/app/services/switch-type.service'

@Component({
  selector: 'app-type-swither',
  templateUrl: './type-swither.component.html',
  styleUrls: ['./type-swither.component.scss'],
  animations: [
    trigger('contentContainerAnimate', [
      state('sights', style({ width: '90px' })),
      state('events', style({ width: '110px' })),
      transition('events <=> sights', animate('300ms ease-in-out')),
      transition('sights <=> events', animate('300ms ease-in-out')),
    ]),
    trigger('textHidden', [
      state('false', style({ opacity: 0 })),
      state('true', style({ opacity: 1 })),
      transition('false <=> true', animate('300ms ease-in-out')),
    ]),
    trigger('sightTypeAnimate', [
      state(
        'true',
        style({
          background: 'white',
        }),
      ),
      state(
        'false',
        style({
          background: 'var(--blue-color)',
        }),
      ),
      transition('true => false', animate('1s ease-in')),
      transition('false => true', animate('1s ease-out')),
    ]),
    trigger('eventTypeAnimate', [
      state(
        'true',
        style({
          background: 'white',
        }),
      ),
      state(
        'false',
        style({
          background: 'var(--orange-color)',
        }),
      ),
      transition('true => false', animate('1s ease-out')),
      transition('false => true', animate('1s ease-in')),
    ]),
  ],
})
export class TypeSwitherComponent implements OnInit {
  private readonly destroy$ = new Subject<void>()
  constructor(private switchTypeService: SwitchTypeService) {}
  type: string = ''
  sight: string = 'sights'
  event: string = 'events'

  switchType() {
    this.switchTypeService.changeType()
    console.log(this.switchTypeService.currentType.value)
  }
  ngOnInit() {
    this.switchTypeService.currentType
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.type = value
      })
  }
}
