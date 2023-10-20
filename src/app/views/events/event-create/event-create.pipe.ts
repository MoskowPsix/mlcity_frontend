import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";


@Pipe({
    name: "safeVideoById"
})
export class SafeUrlPipe implements PipeTransform{
    constructor(private sanitizer: DomSanitizer){}
    transform(owner_id: number = 0, video_id:number = 0,  url?:string) {

        if((owner_id==0 && video_id==0) && url){
            return this.sanitizer.bypassSecurityTrustResourceUrl(url)
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl('https://vk.com/video_ext.php?oid='+ owner_id +'&id=' + video_id + '&hd=2')
    }
}