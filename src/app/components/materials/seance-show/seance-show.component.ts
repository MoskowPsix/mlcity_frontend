import { Component, Input, OnInit } from '@angular/core'
import { ISeance } from 'src/app/models/seance'

@Component({
  selector: 'app-seance-show',
  templateUrl: './seance-show.component.html',
  styleUrls: ['./seance-show.component.scss'],
})
export class SeanceShowComponent implements OnInit {
  constructor() {}
  @Input() seance!: ISeance
  @Input() priceState!: string
  @Input() buyLink!:string
  ngOnInit() {

  }
}
