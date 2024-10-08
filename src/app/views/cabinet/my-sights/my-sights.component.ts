import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core'
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors'
import { SightsService } from 'src/app/services/sights.service'
import { QueryBuilderService } from 'src/app/services/query-builder.service'
import { ToastService } from 'src/app/services/toast.service'
import { OrganizationService } from 'src/app/services/organization.service'
import { Router } from '@angular/router'
@Component({
  selector: 'app-my-events',
  templateUrl: './my-sights.component.html',
  styleUrls: ['./my-sights.component.scss'],
})
export class MySightsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  constructor(
    private sightsService: SightsService,
    private organizationService: OrganizationService,
    private queryBuilderService: QueryBuilderService,
    private toastService: ToastService,
  ) {}
  nextPage: boolean = true
  sights: any[] = []
  router:Router = inject(Router)
  loadSights: boolean = false
  loadMoreSights: boolean = false
  edditModalOpen: boolean = false
  name: any = this.sights
  sightModal: any
  sightModalArray: any[] = []
  MainImgSrc: any = ''
  addNewFile: boolean = false
  previewPhotoUrl!: string
  spiner: boolean = false
  uploadFiles: File[] = []
  imagesPreview: any[] = []
  removedImages: string[] = []
  notFound: boolean = false

  @ViewChild('idImgList') idImgList!: ElementRef
  @ViewChild('widgetsContent') widgetsContent!: ElementRef

  sightsLoadingMore() {
    this.loadMoreSights = true
    this.getMySights()
  }

  getMySights() {
    this.sights.length > 0 ? (this.spiner = true) : null
    if (this.nextPage) {
      this.sightsService
        .getSightsForUser(this.queryBuilderService.queryBuilder('sightsPublicForAuthor'))
        .pipe(
          delay(100),
          retry(3),
          map((response: any) => {
            this.sights.push(...response.sights.data)
            this.sights.length == 0 ? (this.notFound = true) : (this.notFound = false)
            this.spiner = false

            if (response.sights.next_cursor != null) {
              this.queryBuilderService.paginationPublicSightsForAuthorCurrentPage.next(response.sights.next_cursor)
            }
            response.sights.next_cursor ? (this.nextPage = true) : (this.nextPage = false)
          }),
          tap(() => {
            this.loadSights = true
            this.loadMoreSights = false
          }),
          catchError((err) => {
            this.loadSights = true
            console.log(err)
            this.toastService.showToast(MessagesErrors.default, 'danger')
            return of(EMPTY)
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(() => {
          if (this.sights && this.sights.length == 0) {
            this.notFound = true
          }
        })
    } else {
      this.spiner = false
    }
  }

  openModal(sight: any) {
    this.edditModalOpen = true
    this.sightModal = sight
    this.sightModalArray = this.sightModal.files
  }

  organizationNavigation(event:any){
    setTimeout(() => {
      this.router.navigate(['/organizations', event])
    }, 0)
  }

  mainImg(event: any, img: any = null) {
    let MainImg: any = document.getElementsByClassName('mainImgBlock')
    MainImg.src = event.srcElement.currentSrc
    this.sightModalArray[0].link = MainImg.src
  }

  mainImgLoaded() {
    this.MainImgSrc = this.sightModalArray[0].link
  }

  closeModal() {
    this.edditModalOpen = false
  }

  UserAddNewImgs() {
    this.addNewFile = true
  }

  changeFile(event: any) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.uploadFiles.push(event.target.files[i])
    }
    this.previewPhoto()
  }
  ionViewWillEnter() {
    this.sights = []
    this.nextPage = true
    this.getMySights()
  }

  previewPhoto() {
    this.imagesPreview.length = 0
    this.uploadFiles.forEach((file: any) => {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.imagesPreview.push({
          url: reader.result as string,
          name: file.name,
        })
      }
    })
  }

  deleteImg(event: any) {
    const buttonDelete = event.target as HTMLElement
    const btnParrent = buttonDelete.parentElement
    buttonDelete.parentElement?.classList.add('hidden')
    let imgSrc: any = btnParrent?.firstElementChild

    if (imgSrc.src && !this.removedImages.includes(imgSrc.src)) {
      this.removedImages.push(imgSrc.src)
    }
  }
  deleteImgNew(event: any) {
    const buttonDelete = event.target as HTMLElement
    const btnParrent = buttonDelete.parentElement
    const btnGrandpa = btnParrent?.parentElement
    btnGrandpa?.classList.add('hidden')
    let imgSrc: any = btnParrent?.firstElementChild
    const imgName = imgSrc.getAttribute('data-filename')
    if (imgSrc.src && !this.removedImages.includes(imgSrc.src)) {
      this.removedImages.push(imgSrc.src)
      const indexPreview = this.imagesPreview.indexOf(imgSrc.src)

      if (indexPreview !== -1) {
        this.imagesPreview.splice(indexPreview, 1)
      }
      const indexFile = this.uploadFiles.findIndex((image) => image.name === imgName) // ищем файл с именем картинки

      if (indexFile !== -1) {
        //удаляем из массива загруженых файлов, иначе перерисует картинки
        this.uploadFiles.splice(indexFile, 1)
      }
    }

    //  console.log(this.removedImages)
  }

  ngOnInit() {}

  ngOnDestroy() {
    // отписываемся от всех подписок
    this.destroy$.next()
    this.destroy$.complete()
  }
}
