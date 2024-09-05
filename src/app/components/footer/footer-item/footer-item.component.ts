import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { FooterMenu } from 'src/app/models/footer-menu'
import { SwitchTypeService } from 'src/app/services/switch-type.service'

@Component({
  selector: 'app-footer-item',
  templateUrl: './footer-item.component.html',
  styleUrls: ['./footer-item.component.scss'],
})
export class FooterItemComponent implements OnInit {
  @Input() menuItem!: FooterMenu
  feedLink: string = ''
  private readonly destroy$ = new Subject<void>()
  constructor(
    private router: Router,
    private switchTypeService: SwitchTypeService,
  ) {}

  goToPage(path: string) {
    switch (path) {
      case 'feed':
        this.router.navigate([this.feedLink])
        break
      default:
        this.router.navigate([this.menuItem.path])
        break
    }
  }
  isActive(): boolean {
    switch (this.router.url) {
      case this.menuItem.path:
        return true
    }

    if ((this.router.url.includes('events') || this.router.url.includes('sights')) && this.menuItem.path == 'feed') {
      return true
    }

    return false
  }
  ngOnInit() {
    this.switchTypeService.link.pipe(takeUntil(this.destroy$),).subscribe((link: string) => {
      this.feedLink = link
    })
  }
}
