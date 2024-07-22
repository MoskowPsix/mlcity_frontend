import { Component, OnInit } from '@angular/core'
import { SwitchTypeService } from 'src/app/services/switch-type.service'

@Component({
  selector: 'app-type-swither',
  templateUrl: './type-swither.component.html',
  styleUrls: ['./type-swither.component.scss'],
})
export class TypeSwitherComponent implements OnInit {
  constructor(
    private swithTypeService: SwitchTypeService
  ) { }

  swithType() {
    console.log(this.swithTypeService.currentType.value)
    this.swithTypeService.changeType()
  }
  ngOnInit() { }

}
