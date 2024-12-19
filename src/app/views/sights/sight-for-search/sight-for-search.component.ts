import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { FilterService } from 'src/app/services/filter.service'
import { MapService } from 'src/app/services/map.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { SightsService } from 'src/app/services/sights.service'
import { ToastService } from 'src/app/services/toast.service'
import { SightForSearchService } from './sight-for-search.service'
import { finalize } from 'rxjs'
import { Location } from '@angular/common'

@Component({
  selector: 'app-sight-for-search',
  templateUrl: './sight-for-search.component.html',
  styleUrls: ['./sight-for-search.component.scss'],
})
export class SightForSearchComponent {
  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private queryBuilderService: QueryBuilderService,
    private sightsService: SightsService,
    private toastService: ToastService,
    public sightsForSearchTapeService: SightForSearchService,
    private location: Location,
  ) {}

  text: string = ''
  notFound: boolean = false
  spiner: boolean = false
  searchActive: boolean = true
  wait: boolean = false
  nextPage: boolean = true

  clearTemp() {
    this.wait = false
    this.sightsForSearchTapeService.cards = []
    this.notFound = false
    this.queryBuilderService.paginationPublicEventsForSearchCurrentPage.next('')
    this.nextPage = true
  }
  getSights() {
    if (!this.wait && this.nextPage) {
      if (this.sightsForSearchTapeService.cards.length > 0) {
        this.spiner = true
      }
      this.wait = true
      this.sightsService
        .getSightsForSearch(this.text, this.queryBuilderService.queryBuilder('eventsForSearch'))
        .pipe(
          finalize(() => {
            if (this.sightsForSearchTapeService.cards.length === 0) {
              this.notFound = true
            }
            this.spiner = false
            this.wait = false
          }),
        )
        .subscribe((res: any) => {
          // console.log()
          this.sightsForSearchTapeService.cards.push(...res.sights.data)
          let cursor = res.sights.next_cursor
          if (cursor) {
            this.queryBuilderService.paginationPublicEventsForSearchCurrentPage.next(cursor)
            this.nextPage = true
          } else {
            this.nextPage = false
          }
        })
    }
  }
  setParams() {
    return new Promise<void>((resolve) => {
      this.queryBuilderService.columns = ['name']
      this.queryBuilderService.textForSearch = this.sightsForSearchTapeService.text
      resolve()
    })
  }

  searchNavigate(event: any) {
    if (event.length >= 3) {
      this.router.navigate(['/sights/search/', event])
    } else {
      this.toastService.showToast('В поле должно быть не менее 3 символов', 'warning')
    }
  }
  changeSearch() {
    this.location.back()
  }

  eventNavigation(event: any) {
    this.router.navigate(['/sights', event])
  }
  ionViewWillEnter() {
    this.text = this.activatedRouter.snapshot.params['text']
    if (this.sightsForSearchTapeService.text !== this.text) {
      this.sightsForSearchTapeService.text = this.text
      this.clearTemp()
      this.setParams().then(() => {
        this.getSights()
      })
    } else {
      if (this.sightsForSearchTapeService.cards.length == 0) {
        this.notFound = true
      }
    }
  }
  ionViewDidLeave() {}
}
