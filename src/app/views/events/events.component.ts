import { EventsService } from '../../services/events.service';
import { IEvents } from '../../models/events';
import { async } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {

  eventPost!:string
  loadAPI!: Promise<any>;
  // events: IEvents[]=[
  //   {
  //     "vkPost":"VK.Widgets.Post('vk_post_-39122624_142882', -39122624, 142882, 'BfmvMagoDLy0PVNWg0RDk-G9t1cH');",
  //     "vkIdPost":"vk_post_-39122624_142882",
  //   },
  //   {
  //     "vkPost":"VK.Widgets.Post('vk_post_1_45616', 1, 45616, '4mR-o2_COU6XjdBDA9Afjr8qcN7J');",
  //     "vkIdPost":"vk_post_1_45616",
  //   },
  //   {
  //     "vkPost":"VK.Widgets.Post('vk_post_-39122624_142855', -39122624, 142855, 'lFWNGE8x7FoHY5TxFxjdkfGhMjQ9');",
  //     "vkIdPost":"vk_post_-39122624_142855",
  //   },
  // ]

  constructor(public eventsService: EventsService) { }

  ngOnInit() {
    // this.eventsService.getAll().subscribe(() => {
    //   // this.loading = false
    // })

// console.log(this.eventsService)
    // this.events.forEach(async element  => {
    //   // console.log(element)
    //     this.loadAPI = new Promise(async (resolve) => {
    //     console.log('resolving promise...');
    //     await this.loadScript(element.vkPost);
    //     // await this.loadScript("VK.init({apiId: 51529720, onlyWidgets: true});");
    //     // await this.loadScript('VK.Widgets.Comments("vk_comments", {limit: 15, attach: "*"});');
    //     this.eventPost=element.vkIdPost;
        
    // });
    // })



    // this.eventsService.getAll().subscribe(() => {
    // })
  }

//Чтение скриптов
  // public loadScript(vkPost:string) {
  //   console.log('preparing to load...')
  //   let node = document.createElement('script');
  //   // node.src = "./script.js";
  //   node.text=vkPost
  //   node.type = 'text/javascript';
  //   node.async = true;
  //   node.charset = 'utf-8';
  //   document.getElementsByTagName('head')[0].appendChild(node);
  // }

}
