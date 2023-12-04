import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { SightsService } from 'src/app/services/sights.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-sights.component.html',
  styleUrls: ['./my-sights.component.scss'],
})
export class MySightsComponent  implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  constructor(
    private sightsService: SightsService,
    private queryBuilderService: QueryBuilderService,
    private toastService: ToastService,
  ) { }
  nextPage: boolean = false
  sights: any[] = []

  loadSights: boolean = false
  loadMoreSights: boolean = false
  edditModalOpen:boolean = false
  name:any = this.sights
  sightModal:any
  sightModalArray:any[] = []
  MainImgSrc:any = ''
  addNewFile:boolean = false

  @ViewChild('idImgList') idImgList!: ElementRef;
  @ViewChild('widgetsContent') widgetsContent!: ElementRef;
  

  sightsLoadingMore(){
    this.loadMoreSights = true
    this.getMySights()
  }

  getMySights() {
    this.sightsService.getSightsForUser(this.queryBuilderService.queryBuilder('sightsPublicForAuthor')).pipe(
      delay(100),
      retry(3),
      map((respons:any) => {
        this.sights.push(...respons.sights.data)
        if (respons.events.next_cursor) {
          this.queryBuilderService.paginationPublicSightsForAuthorCurrentPage.next(respons.events.next_cursor)
        }
        respons.events.next_cursor ? this.nextPage = true : this.nextPage = false
      }),
      tap(() => {
        this.loadSights = true  
        this.loadMoreSights = false
      }),
      catchError((err) =>{
        this.loadSights = true
        this.toastService.showToast(MessagesErrors.default, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  
  openModal(sight:any){
    this.edditModalOpen = true
    this.sightModal = sight
    this.sightModalArray = this.sightModal.files
    console.log(this.widgetsContent?.nativeElement)
   
  }

  mainImg(event:any){
    let MainImg:any = document.getElementsByClassName("mainImgBlock")
    MainImg.src = event.srcElement.currentSrc
    this.sightModalArray[0].link =  MainImg.src
   
    }
  
  mainImgLoaded(){
    this.MainImgSrc =  this.sightModalArray[0].link
  }
 


  closeModal(){
    this.edditModalOpen = false
  }

  UserAddNewImgs(){
    this.addNewFile = true
  }

  ngOnInit() {
    this.getMySights();
  }
  
  ngOnDestroy(){
    // отписываемся от всех подписок
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
