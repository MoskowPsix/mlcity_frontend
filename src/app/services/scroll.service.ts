import { ElementRef, HostListener, Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) 
  {

  }
  
  public scrollYTemp:BehaviorSubject<number> = new BehaviorSubject<number>(0)
  public scrollY:BehaviorSubject<number> = new BehaviorSubject<number>(0)
  public checkScrollEdgeFunc!: ()=>void
  public scrollBlock!:ElementRef
  public scrollStart(block?:ElementRef){
    if(block?.nativeElement){
     let blockHtml = block.nativeElement
     this.scrollYTemp.next(blockHtml.clientHeight)
     blockHtml.addEventListener('scroll',(event:any)=>{
      console.log('scroll')
      this.checkScrollEdge(this.checkScrollEdgeFunc,this.scrollBlock)
     })
    }else{
      this.scrollYTemp.next(this.document.body.scrollTop)
      this.document.body.addEventListener('scroll', (event)=>{
        this.scrollY.next(this.document.body.scrollTop)
        this.checkScrollEdge(this.checkScrollEdgeFunc,this.scrollBlock)
      });
    }
 
  }

  public scrollEnd(){
    this.document.body.removeEventListener('scroll', ()=>{
      console.log('END SCROLL')  
    });
  }

  checkScrollEdge(func: () => void, element?:ElementRef) {
    if (func && !element) {
      let edgePosition = this.document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= edgePosition) {
        func();
        this.scrollYTemp.next(window.scrollY);
      }
    }else if(element?.nativeElement){
      let block:HTMLElement = element?.nativeElement
      let edgePosition:any = block.scrollHeight - block.clientHeight
      if (window.scrollY >= edgePosition) {
        func();
        this.scrollYTemp.next(window.scrollY);
      }
    }
  }
  

setCheckScrollEdge(func:()=>void, element?:ElementRef):void{
  this.clearScroll()
  this.checkScrollEdgeFunc = func
}

clearScroll(){
  this.scrollYTemp.next(0)

}

}
