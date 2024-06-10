import { Component } from '@angular/core'
import { Input } from '@angular/core'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.scss'],
})
export class MiniCardComponent {
  @Input() image!: string
  @Input() title!: string
  @Input() description!: string
  @Input() id!: number
  BACKEND_URL: string = environment.BACKEND_URL
  BACKEND_PORT: string = environment.BACKEND_PORT
  constructor() {}
}
