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
  @Input() routing!: string
  ngOnInit() {}
}
