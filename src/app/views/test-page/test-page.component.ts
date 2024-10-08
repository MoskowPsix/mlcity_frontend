import { Component, OnInit, SimpleChanges } from '@angular/core'
import { EventHistoryContent } from 'src/app/clasess/history_content/event_history_content'

interface Placemark {
  geometry: number[]
  properties: ymaps.IPlacemarkProperties
  options: ymaps.IPlacemarkOptions
}

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.scss'],
})
export class TestPageComponent implements OnInit {
  openModal = false
  categories: any = []
  switcherState: boolean = false
  changeState(
    itemFirstText: HTMLElement,
    itemFirstImg: HTMLElement,
    itemSecond: HTMLElement,
    itemSecondImg: HTMLElement,
  ) {
    if (this.switcherState == false) {
      itemFirstText.style.transform = 'translate(5rem)'
      setTimeout(() => {
        itemFirstText.style.opacity = '0'
      }, 100)
      itemFirstImg.classList.add('fire_non-active')
      itemSecond.style.transform = 'translate(-3.5rem)'
      itemSecondImg.classList.add('flag_active')
    } else {
      itemFirstImg.classList.remove('fire_non-active')
      itemSecond.style.transform = 'translate(0rem)'
      itemFirstText.style.opacity = '1'
      setTimeout(() => {
        itemFirstText.style.transform = 'translate(0rem)'
      }, 100)

      itemSecondImg.classList.remove('flag_active')
    }

    this.switcherState = !this.switcherState
  }
  openModalFnc() {
    this.openModal = true
    // console.log(this.openModal)
  }
  closeModal() {
    this.openModal = false
  }
  addCaategory(category: any) {
    this.categories.push(category)
  }
  deleteCaategory(index: any) {
    this.categories.splice(index, 1)
  }
  checkEditFunc() {
    let orig = {
      id: 1,
      name: 'Квест «Тайны Поднебесной»',
      sponsor:
        'Муниципальное казённое учреждение культуры «Централизованная библиотечная система» Артёмовского городского округа',
      description:
        '2024 и 2025 годы объявлены «перекрестными» годами культуры России и Китая. Китай является ближайшим зарубежным соседом Приморского края. Край тесно сотрудничает с ним в экономическом, культурном и туристическом аспекте. Игра посвящена культуре и традициям Китайского государства и совместным дружеским связям. Путешествуя по станциям, ребята вспомнят изобретения древнего Китая, которые прочно вошли в жизнь многих людей по всему миру. Познакомятся с самыми популярными праздниками китайского народа. Узнают много интересного о самых знаменитых достопримечательностях дружественного государства. Попробуют себя в роли переводчиков с китайского, смастерят веер. Детей ждут загадки, ребусы, филворды и творческие задания.',
      price: [
        {
          id: 2,
          event_id: 1,
          sight_id: null,
          cost_rub: '50',
          descriptions: 'Одна цена на все билеты.',
          created_at: '2024-06-10T09:11:46.000000Z',
          updated_at: '2024-06-10T09:11:46.000000Z',
        },
      ],
      materials: '',
      date_start: '2024-06-18 00:30:00',
      date_end: '2024-06-18 01:10:00',
      places: [
        {
          id: 1,
          longitude: 54,
          latitude: 24,
          address: 'TG',
          seances: [
            {
              id: 1,
              date_start: 'a',
              date_end: 'b',
            },
            {
              id: 2,
              date_start: 'ab',
              date_end: 'bb',
            },
          ],
        },
        {
          id: 2,
          longitude: 2,
          latitude: 24,
          address: 'TGB',
        },
      ],
      types: [
        {
          id: 9,
          name: 'Встречи',
          ico: '/storage/icons/initiative.svg',
          created_at: '2024-06-07T13:48:41.000000Z',
          updated_at: '2024-06-07T13:48:41.000000Z',
          cult_id: 33,
          etype_id: null,
          pivot: {
            event_id: 1,
            etype_id: 9,
          },
        },
      ],
      files: [
        {
          id: 4,
          name: 'd511eb6769cf059a63a987bf85e42ed8.jpg',
          link: 'https://cdn.culture.ru/images/93acd166-1610-56e1-a04e-16cead34e728/w_2048,h_1536/d511eb6769cf059a63a987bf85e42ed8.jpg',
          local: 0,
          event_id: 1,
          created_at: '2024-06-10T09:11:46.000000Z',
          updated_at: '2024-06-10T09:11:46.000000Z',
          file_types: [
            {
              id: 1,
              name: 'image',
              created_at: '2024-06-07T13:48:41.000000Z',
              updated_at: '2024-06-07T13:48:41.000000Z',
              pivot: {
                file_id: 4,
                type_id: 1,
              },
            },
          ],
        },
      ],
    }
    let edited = {
      id: 1,
      // измененное название
      name: 'Квест «»',
      // измененный спонсор
      sponsor: 'Муниципальное казённое учреждение культуры « » Артёмовского городского округа',
      // измененно описание
      description:
        '2024 и 2100 годы объявлены «перекрестными» годами культуры России и Китая. Китай является ближайшим зарубежным соседом Приморского края. Край тесно сотрудничает с ним в экономическом, культурном и туристическом аспекте. Игра посвящена культуре и традициям Китайского государства и совместным дружеским связям. Путешествуя по станциям, ребята вспомнят изобретения древнего Китая, которые прочно вошли в жизнь многих людей по всему миру. Познакомятся с самыми популярными праздниками китайского народа. Узнают много интересного о самых знаменитых достопримечательностях дружественного государства. Попробуют себя в роли переводчиков с китайского, смастерят веер. Детей ждут загадки, ребусы, филворды и творческие задания.',
      price: [
        {
          id: 2,
          event_id: 1,
          sight_id: null,
          cost_rub: '150', // цена изменена
          descriptions: 'Одна цена на все билеты.',
          created_at: '2024-06-10T09:11:46.000000Z',
          updated_at: '2024-06-10T09:11:46.000000Z',
        },
        {
          // новая цена
          cost_rub: '250',
          description: 'Новая цена на билеты',
        },
      ],
      // изменены материалы
      materials: 'Новые материалы',
      // новая дата
      date_start: '2024-06-21 00:30:00',
      // новая дата
      date_end: '2024-06-24 01:10:00',
      places: [
        // измененное место
        {
          id: 1,
          longitude: 54,
          latitude: 24,
          address: 'TG',
          seances: [
            {
              id: 1,
              date_start: 'aa',
              date_end: 'ba',
            },
            {
              id: 2,
              on_delete: true,
              date_start: 'ab',
              date_end: 'bb',
            },
            {
              date_start: 'a2',
              date_end: 'a3',
            },
          ],
        },
        // Новое место
        {
          latitude: 54,
          longitude: 24,
          address: 'T',
        },
        {
          id: 2,
          on_delete: true,
          longitude: 2,
          latitude: 24,
          address: 'TGB',
        },
      ],
      types: [
        {
          id: 9,
          name: 'Встречи',
          ico: '/storage/icons/initiative.svg',
          created_at: '2024-06-07T13:48:41.000000Z',
          updated_at: '2024-06-07T13:48:41.000000Z',
          cult_id: 33,
          etype_id: null,
          pivot: {
            event_id: 1,
            etype_id: 9,
          },
        },
      ],
      files: [
        {
          id: 4,
          name: 'd511eb6769cf059a63a987bf85e42ed8.jpg',
          link: 'https://cdn.culture.ru/images/93acd166-1610-56e1-a04e-16cead34e728/w_2048,h_1536/d511eb6769cf059a63a987bf85e42ed8.jpg',
          local: 0,
          event_id: 1,
          created_at: '2024-06-10T09:11:46.000000Z',
          updated_at: '2024-06-10T09:11:46.000000Z',
          file_types: [
            {
              id: 1,
              name: 'image',
              created_at: '2024-06-07T13:48:41.000000Z',
              updated_at: '2024-06-07T13:48:41.000000Z',
              pivot: {
                file_id: 4,
                type_id: 1,
              },
            },
          ],
        },
      ],
    }
    let eventHistoryContent = new EventHistoryContent()
  }
  ngOnInit(): void {}
}
