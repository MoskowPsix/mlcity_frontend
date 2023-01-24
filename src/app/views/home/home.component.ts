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
      "image":"https://sun3.userapi.com/sun3-11/s/v1/ig2/QtC5BaL_C8PDOTfazM51SI6b4jhx-EYA8zlbg6f-G5vSsGtXuqMRi7l9fgnYyWhY8HLvcezF6Zw74FPLiVqJkfy8.jpg?size=604x376&quality=95&type=album",
      "properties": {
        "balloonContentHeader":"Заголовок если необходим",
        "balloonContentBody":`🚉Ориентация – север: с сегодняшнего дня стартуют рейсы "Ласточки" в северные города Свердловской области 🌠

        <br>📆С 20 января Свердловская железная дорога запускает ежедневные рейсы "Ласточек" по маршруту Екатеринбург – Серов – Бокситы (город Североуральск). Время в пути – 7,5 часов.
        <br>📌Остановки будут на следующих станциях: ВИЗ, Нижний Тагил, Смычка, Баранчинская, Гороблагодатская, Кушва, Верхняя, Выя, Верхотурье, Ляля, Лобва, Серов, Краснотурьинская, Лесная Волчанка.
        <br>📜Расписание рейсов – следующее👇:
        <br>⏱Поезд №7076: от станции Бокситы – отправление в 4:15, в Серов состав прибудет в 6:02, а в Екатеринбург – в 11:44.
        <br>⏱Обратный поезд № 7075: из Екатеринбурга отправление в 16:00, из Серова – в 21:56 и прибытие в Североуральск – в 23:30.
        <br>✅Напомним: раньше добраться до станции Бокситы из Екатеринбурга можно было только пересев в Серове на междугородний автобус. Запуск новых поездов позволил сократить этот путь на 2 часа.
        <br>💰До конца января стоимость билета от Екатеринбурга до Боксит составит 883 рубля. Будут действовать все виды льгот, установленных для проезда в пригородном железнодорожном транспорте.
        
        <br>По информации "ОГ"<br> <img src="https://sun3.userapi.com/sun3-11/s/v1/ig2/QtC5BaL_C8PDOTfazM51SI6b4jhx-EYA8zlbg6f-G5vSsGtXuqMRi7l9fgnYyWhY8HLvcezF6Zw74FPLiVqJkfy8.jpg?size=604x376&quality=95&type=album">`,
        "balloonContentFooter":'<img src="https://sun3.userapi.com/sun3-11/s/v1/ig2/QtC5BaL_C8PDOTfazM51SI6b4jhx-EYA8zlbg6f-G5vSsGtXuqMRi7l9fgnYyWhY8HLvcezF6Zw74FPLiVqJkfy8.jpg?size=604x376&quality=95&type=album">',
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
        "balloonContentBody":'В последние месяцы все более модной становится тема эмиграции из России. По обыкновению, пойду против тренда — публикую 7 причин оставаться в России.<br><div class="page_post_sized_thumbs  clear_fix" style="width: 208px; height: 129px; "><img style="background: #FFF url(/images/progress7.gif) center no-repeat" src="https://sun3.userapi.com/sun3-11/s/v1/if1/HHTFuaEJ0DzNRgGAqyaeep4zpSepS-I1b0EHY2YboqKlmF44oIUJjpaMSFs-cOjoecOsDA.jpg?size=604x539&amp;quality=96&amp;type=album"><br><img style="background: #FFF url(/images/progress7.gif) center no-repeat" src="https://sun3.userapi.com/sun3-8/s/v1/if1/6G1GvFidWlHTGjv2vVD6743YK7zvvKuUQldGgjXHwAxqS22AvHyJt8rjh-FQTaTkl2Zaeg.jpg?size=604x539&amp;quality=96&amp;type=album"></div>',
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
        "balloonContentHeader":"Тропические циклоны, торнадо (зарождение, причины устойчивости).",
        "balloonContentBody":'В последние месяцы все более модной становится тема эмиграции из России. По обыкновению, пойду против тренда — публикую 7 причин оставаться в России.<br><div class="page_post_sized_thumbs  clear_fix" style="width: 208px; height: 129px; "><img style="background: #FFF url(/images/progress7.gif) center no-repeat" src="https://sun3.userapi.com/sun3-11/s/v1/if1/HHTFuaEJ0DzNRgGAqyaeep4zpSepS-I1b0EHY2YboqKlmF44oIUJjpaMSFs-cOjoecOsDA.jpg?size=604x539&amp;quality=96&amp;type=album"><br><img style="background: #FFF url(/images/progress7.gif) center no-repeat" src="https://sun3.userapi.com/sun3-8/s/v1/if1/6G1GvFidWlHTGjv2vVD6743YK7zvvKuUQldGgjXHwAxqS22AvHyJt8rjh-FQTaTkl2Zaeg.jpg?size=604x539&amp;quality=96&amp;type=album"></div>',
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
         balloonPanelMaxMapArea: 0,
         balloonContentBody:element.properties.balloonContentBody,
        //  balloonContentFooter:element.properties.balloonContentFooter,
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

//Вывод поста ВК в метку
  // onPlacemarkBalloonOpen(event: YaEvent<ymaps.Placemark>,vkPost:string, vkIdPost:string): void {
  //   const { target } = event;
  //   let q=vkPost
  //   console.log(target)
  //     this.loadAPI = new Promise(async(resolve) => {
  //       console.log('resolving promise...');
  //       await this.loadScript(vkPost);
  //       // target.properties.set('balloonContent', `<div style="width:1000rem; height:1000rem"><div id="${vkIdPost}"></div></div>`);
  //   });
  // }
}
