import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { SightsService } from 'src/app/services/sights.service';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderService } from 'src/app/services/query-builder.service';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-sight-gallery',
  templateUrl: './sight-gallery.component.html',
  styleUrls: ['./sight-gallery.component.scss'],
})
export class SightGalleryComponent  implements OnInit {

  constructor(
    private sightsService: SightsService,
    private queryBuilderService: QueryBuilderService,
    private toastService: ToastService,
  ) { }


  nextPage: boolean = false
  @Input() files!: any
    
  loadSights: boolean = false
  loadMoreSights: boolean = false
  edditModalOpen:boolean = false
  sightModalArray:any[] = [] //Главный массив с картинками, загруженными ранее
  MainImgSrc:any = ''
  addNewFile:boolean = false
  previewPhotoUrl!:string
  uploadFiles: File[] = [] //загруженые файлы
  imagesPreview: any[] = [] //превьюшки
  removedImages:string[] = [] //удаляшки

  @ViewChild('idImgList') idImgList!: ElementRef;
  @ViewChild('widgetsContent') widgetsContent!: ElementRef;
  



  getMySights() {
    this.sightModalArray = this.files
  }

  


  mainImg(event:any, img: any = null){
    console.log(event.target)
    let MainImg:any = document.getElementsByClassName("mainImgBlock")
    MainImg.src = event.srcElement.currentSrc
    this.sightModalArray[0].link =  MainImg.src
   
    }
  
  mainImgLoaded(){
    this.MainImgSrc =  this.sightModalArray[0].link
  }
 


  UserAddNewImgs(){
    this.addNewFile = true
  }

  changeFile(event:any){
      for (var i = 0; i < event.target.files.length; i++) {
            this.uploadFiles.push(event.target.files[i])
            console.log(this.uploadFiles)
          }
          this.previewPhoto()
  }

  previewPhoto(){
    this.imagesPreview.length=0;
    this.uploadFiles.forEach((file: any) => {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.imagesPreview.push({url: reader.result as string, name: file.name })
       
      }
    })

  }


  deleteImg(event:any){
    const buttonDelete = event.target as HTMLElement
    const btnParrent = buttonDelete.parentElement
    buttonDelete.parentElement?.classList.add('hidden')
   let imgSrc:any = btnParrent?.firstElementChild
  
   if (imgSrc.src && !this.removedImages.includes(imgSrc.src)) {
    this.removedImages.push(imgSrc.src);
  }

  }
  deleteImgNew(event:any){
    
    const buttonDelete = event.target as HTMLElement
    const btnParrent = buttonDelete.parentElement
    const btnGrandpa = btnParrent?.parentElement
    btnGrandpa?.classList.add('hidden')
    let imgSrc:any = btnParrent?.firstElementChild
    const imgName = imgSrc.getAttribute('data-filename')
    console.log(imgName)
    if (imgSrc.src && !this.removedImages.includes(imgSrc.src)) {
      this.removedImages.push(imgSrc.src);
      const indexPreview =  this.imagesPreview.indexOf(imgSrc.src)
     
      if(indexPreview !== -1){
        this.imagesPreview.splice(indexPreview,1)
        
     
      }
      const indexFile = this.uploadFiles.findIndex(image => image.name === imgName) // ищем файл с именем картинки
      
      if(indexFile !== -1){ //удаляем из массива загруженых файлов, иначе перерисует картинки
        this.uploadFiles.splice(indexFile,1)
      }

    }


 

  //  console.log(this.removedImages)
  }
  






  ngOnInit() {
    this.getMySights();
    console.log(this.files)
  }
  
  ngOnDestroy(){
  
  }



  


}
