import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { Subscription, map } from 'rxjs';
import { MapService } from '../../services/map.service';

interface Placemark {
  geometry: number[];
  properties: ymaps.IPlacemarkProperties;
  options: ymaps.IPlacemarkOptions;
  vkPost: string;
  vkIdPost:string;
  
}
interface Citys {
  id: number;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
})
export class HomeComponent implements OnInit {

  loadAPI!: Promise<any>;
  map!:YaReadyEvent<ymaps.Map>
  placemark!: ymaps.Placemark
  evetsArray: string[]=[]
  sightsArray: string[]=[]

  clustererOptions: ymaps.IClustererOptions = {
    gridSize: 32,
    clusterDisableClickZoom: true,
    preset: 'islands#greenClusterIcons',
  };

  citys: any[] = [
    {
      id: 1,
      name: 'Заречный, Свердловская область',
    },
    {
      id: 2,
      name: 'Асбест',
    },
    {
      id: 3,
      name: 'Екатеринбург',
    }
  ];

  events: any[] = [
    {
      id: 1,
      name: 'Детские',
    },
    {
      id: 2,
      name: 'Культурно-развлекательные',
    },
    {
      id: 3,
      name: 'Торгово-выставочные',
    },
    {
      id: 4,
      name: 'Образовательные',
    },
    {
      id: 5,
      name: 'Спортивные',
    },
    {
      id: 6,
      name: 'Благотворительные',
    },
    {
      id: 7,
      name: 'Общественные',
    },
    {
      id: 8,
      name: 'Деловые',
    },
    {
      id: 9,
      name: 'Киноафиша',
    }
  ];

  sights: any[] = [
    {
      id: 1,
      name: 'Архитектурные',
    },
    {
      id: 2,
      name: 'Исторические',
    },
    {
      id: 3,
      name: 'Музеи',
    },
    {
      id: 4,
      name: 'Театры',
    },
    {
      id: 5,
      name: 'Природные парки',
    },
    {
      id: 6,
      name: 'Святыни',
    },
    {
      id: 7,
      name: 'Смотровая площадка',
    },
    {
      id: 8,
      name: 'Спортивные',
    },
    {
      id: 9,
      name: 'Зоопитомники',
    },
    {
      id: 10,
      name: 'Индустриальные',
    },
    {
      id: 11,
      name: 'Развлекательный парк',
    },
    {
      id: 12,
      name: 'Гостевой маршрут',
    },
  ];

    // Определение местоположени через браузер
    onMapReady(event: YaReadyEvent<ymaps.Map>): void {
      this.map=event
      this.mapService.geolocationMap(event);
    }

  selectionCity(data:any){
    let newSelection = data.detail.value;
    // Декодирование координат
    const geocodeResult = this.yaGeocoderService.geocode(data.detail.value, {
      results: 1,
    });

    geocodeResult.subscribe((result: any) => {
      const firstGeoObject = result.geoObjects.get(0);
      const coords = firstGeoObject.geometry.getCoordinates();
      const bounds = firstGeoObject.properties.get('boundedBy');
      firstGeoObject.properties.set(
        'iconCaption',
        firstGeoObject.getAddressLine()
      );
      this.map.target.setBounds(bounds, {
        // checkZoomRange: true,
      });
    }) 
  }

  selectionSights(data:any){
    this.sightsArray=data.detail.value
    this.addPlacemarks()
  }

  selectionEvents(data:any){
    this.evetsArray=data.detail.value
    this.addPlacemarks()
  }

  points=[
    {
      "geometry": [56.831903, 61.411961],
      "vkPost":"VK.Widgets.Post('vk_post_1_45616', 1, 45616, '4mR-o2_COU6XjdBDA9Afjr8qcN7J');",
      "vkIdPost":"vk_post_1_45616",
      "preset": "islands#greenDotIcon",
      "iconColor": "#735184",
      "event":"Детские",
      "sight":"",
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
      "event":"Спортивные",
      "sight":"",
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
      "event":"",
      "sight":"Спортивные",
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



  placemarks: Placemark[] = [];

  constructor(private http: HttpClient, private mapService:MapService, private yaGeocoderService: YaGeocoderService) {}


  addPlacemarks()
  {
    if (this.map)
    {
      console.log(this.map.target.geoObjects.options.getAll())
      this.map.target.geoObjects.removeAll()
    }
    
    this.points.forEach(element => {

      this.evetsArray.forEach(event=>{
        
        if ((element.event==event) )
        {
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
        }
  
      })

      this.sightsArray.forEach(sight=>{
        
        if ((element.sight==sight) )
        {
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
        }
  
      })
  
  
    });
  }
  ngOnInit() {
    this.addPlacemarks()
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
