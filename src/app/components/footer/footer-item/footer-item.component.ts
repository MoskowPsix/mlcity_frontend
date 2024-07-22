import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FooterMenu } from 'src/app/models/footer-menu';

@Component({
  selector: 'app-footer-item',
  templateUrl: './footer-item.component.html',
  styleUrls: ['./footer-item.component.scss'],
})
export class FooterItemComponent implements OnInit {
  @Input() menuItem!: FooterMenu

  constructor(private router: Router) {}

  goToPage(path: string) {
    switch (path) {
      case 'home':
        this.router.navigate(['home'])
        break
      case 'feed':
        this.router.navigate(['events'])
        break
    }
  }
  isActive(): boolean {
    switch (this.router.url) {
      case this.menuItem.path:
        return true
    }

    return false
  }
  ngOnInit() {
  }
}
