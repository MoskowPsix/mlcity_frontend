import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { YaEvent, YaReadyEvent } from 'angular8-yandex-maps';
import { Subscription } from 'rxjs';

interface Placemark {
  geometry: number[];
  properties: ymaps.IPlacemarkProperties;
  options: ymaps.IPlacemarkOptions;
  vkPost: string;
  vkIdPost:string;
  
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
})
export class HomeComponent implements OnInit {

  loadAPI!: Promise<any>;

  clustererOptions: ymaps.IClustererOptions = {
    gridSize: 32,
    clusterDisableClickZoom: true,
    preset: 'islands#greenClusterIcons',
  };

  points=[
    {
      "geometry": [56.831903, 61.411961],
      "vkPost":"VK.Widgets.Post('vk_post_1_45616', 1, 45616, '4mR-o2_COU6XjdBDA9Afjr8qcN7J');",
      "vkIdPost":"vk_post_1_45616",
      "preset": "islands#greenDotIcon",
      "iconColor": "#735184",
      "properties": {
        "balloonContentHeader":"Заголовок если необходим",
        "balloonContentBody":"Многие из нас слышали о квантовых компьютерах, но знают о том, что они из себя представляю – далеко не все. Давайте разбираться.",
        "balloonContentFooter":"footer",
        "hintContent":"Содержание всплывающей подсказки",
      },
      "options":{
        "preset": "islands#greenDotIcon",
        "iconColor": "#735184",
      },
    },
    {
      "geometry": [56.763338, 61.565466],
      "vkPost":" VK.Widgets.Post('vk_post_-39122624_142873', -39122624, 142873, 'fE0s5y99SDPJLrwkGc8OuX-XcRSe');",
      "vkIdPost":"vk_post_-39122624_142873",
      "preset": "islands#greenDotIcon",
      "iconColor": "#735184",
      "properties": {
        "balloonContentHeader":"Тропические циклоны, торнадо (зарождение, причины устойчивости).",
        "balloonContentBody":"<img url='http://psy.tom.ru/pic/tornado_01.gif'/><br>Статья о природе атмосферных стихий. В частности, рассматривается процесс конденсации переохлаждённого водяного пара, который может вызвать резкое понижение давления, шквалистые ветры и вихри. Вероятно, образующаяся воронка вихря раскручивается ускоренными воздушными потоками, огибающими турбулентные «выступы»",
        "balloonContentFooter":"footer",
        "hintContent":"Содержание всплывающей подсказки",
      },
      "options":{
        "preset": "islands#greenDotIcon",
        "iconColor": "#735184",
      },
    },
    {
      "geometry": [56.813259, 61.322973],
      "vkPost":"VK.Widgets.Post('vk_post_-39122624_142855', -39122624, 142855, 'lFWNGE8x7FoHY5TxFxjdkfGhMjQ9');",
      "vkIdPost":"vk_post_-39122624_142855",
      "preset": "islands#greenDotIcon",
      "iconColor": "#735184",
      "properties": {
        "balloonContentHeader":"Заголовок если необходим",
        "balloonContentBody":"<div id='vk_post_1_45616'></div>  $('body').append(menuContent);",
        "balloonContentLayout":"<div id='vk_post_1_45616'></div> ",
        "balloonContentFooter":"footer",
        "hintContent":"Содержание всплывающей подсказки",
      },
      "options":{
        "preset": "islands#greenDotIcon",
        "iconColor": "#735184",
      },
    },
  ]

  // Определение местоположени через браузер
  onMapReady(event: YaReadyEvent<ymaps.Map>): void {
    const map = event.target;

    ymaps.geolocation
      .get({
        provider: 'browser',
        mapStateAutoApply: true,
      })
      .then((result) => {
        result.geoObjects.options.set('visible', false);
        map.geoObjects.add(result.geoObjects);
      });
  }

  placemarks: Placemark[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
   this.points.forEach(element => {
      // console.log(element)
      this.placemarks.push({
        geometry: element.geometry,
        vkPost:element.vkPost,
        vkIdPost:element.vkIdPost,
        properties: {
        // balloonPanelMaxMapArea: 0,
        // hintContent: element.properties.hintContent,
        },
        options: {
          preset: element.options.preset, //вид иконок, если необходимо будет менять
          iconColor: element.options.iconColor, //цвет иконок, если необходимо будет менять
          openEmptyBalloon: true,
        },
      });
    });
  }


//Чтение скриптов
public loadScript(vkPost:string) {
  console.log('preparing to load...')
  let node = document.createElement('script');
  // node.src = "./script.js";
  node.text=vkPost
  node.type = 'text/javascript';
  node.async = true;
  node.charset = 'utf-8';
  document.getElementsByTagName('head')[0].appendChild(node);
}

//Вывод поста ВК в метку
  onPlacemarkBalloonOpen(event: YaEvent<ymaps.Placemark>,vkPost:string, vkIdPost:string): void {
    const { target } = event;
    let q=vkPost
    console.log(target)
      this.loadAPI = new Promise(async(resolve) => {
        console.log('resolving promise...');
        await this.loadScript(vkPost);
        target.properties.set('balloonContent', `<div style="width:1000rem; height:1000rem"><div id="${vkIdPost}"></div></div>`);
    });
  }
}
