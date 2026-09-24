import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-profile-item',
  templateUrl: './profile-item.component.html',
  styleUrls: ['./profile-item.component.scss'],
})
export class ProfileItemComponent implements OnInit {
  constructor() {}
  @Input() name!: string
  @Input() icon!: string
  @Input() iconColor!: string
  @Input() iconFilter!: string
  @Input() routing!: string

  ngOnInit() {}

  /** Снимаем фокус до того, как Ionic повесит aria-hidden на уходящую страницу */
  onNavigate(event: Event): void {
    const target = event.currentTarget as HTMLElement | null
    target?.blur()
    ;(document.activeElement as HTMLElement | null)?.blur?.()
  }
}
