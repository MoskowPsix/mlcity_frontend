import { Component, Input, OnInit } from '@angular/core'
import { StoreInfo } from 'src/app/models/store-info'
import { CheckVersionService } from 'src/app/services/check-version.service'

@Component({
  selector: 'app-update-version-modal',
  templateUrl: './update-version-modal.component.html',
  styleUrls: ['./update-version-modal.component.scss'],
})
export class UpdateVersionModalComponent implements OnInit {
  stores!: StoreInfo[]
  isOpen: boolean = true
  constructor(private checkVersionService: CheckVersionService) {}

  openStore(url: string): void {
    window.open(url)
  }
  closeModal() {
    this.isOpen = !this.isOpen
  }

  async ngOnInit() {
    if (await this.checkVersionService.checkVersionIsDeprecated()) {
      this.isOpen = true
      this.stores = this.checkVersionService.getAvalibleStores()
    }
  }
}
