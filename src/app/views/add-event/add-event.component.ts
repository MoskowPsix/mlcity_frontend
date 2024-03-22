import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { YaEvent, YaGeocoderService, YaReadyEvent } from 'angular8-yandex-maps';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss'],
})
export class AddEventComponent {
  coords!: number[];
  placemark!: ymaps.Placemark;
  search!: string;
  searchForm!: FormGroup;
  map!: YaReadyEvent<ymaps.Map>;
  placemarkStart!: ymaps.Placemark;
  placemarkStop!: ymaps.Placemark;
  typeSelected: number | null = null;
  pol: number[][] = [];

  Polyline!: ymaps.Polyline;

  types = [
    { id: 1, name: 'Пешком' },
    { id: 2, name: 'Авто' },
    { id: 3, name: 'Полилинии' },
  ];
  selectedType(event: any) {
    this.typeSelected = event.detail.value;
    console.log(this.typeSelected);
  }

  constructor(
    private yaGeocoderService: YaGeocoderService,
    private mapService: MapService
  ) {}

  //При клике ставим метку старта, если метка есть, то ставим метку стоп и создаем маршрут
  onMapClick(e: YaEvent<ymaps.Map>): void {
    const { target, event } = e;
    if (this.typeSelected == 1) {
      //Задание начальной и конечной точки для авто маршрута
      if (!this.placemarkStart) {
        this.placemarkStart = new ymaps.Placemark(
          [
            event.get('coords')[0].toPrecision(6),
            event.get('coords')[1].toPrecision(6),
          ],
          { iconContent: 'Старт' },
          {
            visible: true,
            preset: 'islands#greenStretchyIcon',
            draggable: false,
          }
        );
        this.map.target.geoObjects.add(this.placemarkStart);
        this.pol.push([
          event.get('coords')[0].toPrecision(6),
          event.get('coords')[1].toPrecision(6),
        ]);

        // console.log("Метка старт не существует")
      } else if (!this.placemarkStop) {
        this.pol.push([
          event.get('coords')[0].toPrecision(6),
          event.get('coords')[1].toPrecision(6),
        ]);
        this.createPedestrianRouteMap();
      }
    } else if (this.typeSelected == 2) {
      //Задание начальной и конечной точки для авто маршрута
      if (!this.placemarkStart) {
        this.placemarkStart = new ymaps.Placemark(
          [
            event.get('coords')[0].toPrecision(6),
            event.get('coords')[1].toPrecision(6),
          ],
          { iconContent: 'Старт' },
          {
            visible: true,
            preset: 'islands#greenStretchyIcon',
            draggable: false,
          }
        );
        this.map.target.geoObjects.add(this.placemarkStart);
        // console.log("Метка старт не существует")
      } else if (!this.placemarkStop) {
        // console.log("Метка старт существует, метка стоп нет")
        this.placemarkStop = new ymaps.Placemark(
          [
            event.get('coords')[0].toPrecision(6),
            event.get('coords')[1].toPrecision(6),
          ],
          { iconContent: 'Стоп' },
          {
            visible: true,
            preset: 'islands#redStretchyIcon',
            draggable: false,
          }
        );
        this.map.target.geoObjects.add(this.placemarkStop);
        this.createAutoRouteMap(
          this.placemarkStart,
          this.placemarkStart.geometry?.getCoordinates()!,
          this.placemarkStop.geometry?.getCoordinates()!
        );
      }
    } else if (this.typeSelected == 3) {
      if (!this.placemarkStart) {
        this.placemarkStart = new ymaps.Placemark(
          [
            event.get('coords')[0].toPrecision(6),
            event.get('coords')[1].toPrecision(6),
          ],
          { iconContent: 'Старт' },
          {
            visible: true,
            preset: 'islands#greenStretchyIcon',
            draggable: false,
          }
        );
        this.map.target.geoObjects.add(this.placemarkStart);
        this.createPolylineRouteMap();

        //   // console.log("Метка старт не существует")
        // } else if (!this.placemarkStop){
        //   // console.log("Метка старт существует, метка стоп нет")
        //   this.placemarkStop= new ymaps.Placemark([event.get('coords')[0].toPrecision(6), event.get('coords')[1].toPrecision(6)],{iconContent: "Стоп"},{visible: true, preset: 'islands#redStretchyIcon', draggable: false,})
        //   this.map.target.geoObjects.add(this.placemarkStop)
        //   this.createPolylineRouteMap()
      }
    }
  }

  // Поиск по улицам
  onMapReady(e: YaReadyEvent<ymaps.Map>): void {
    this.map = e;
  }

  createPolylineRouteMap() {
    this.Polyline = new ymaps.Polyline(
      [this.placemarkStart.geometry?.getCoordinates()!],
      {},
      { draggable: true, strokeColor: '#00000088', strokeWidth: 4 }
    );
    this.map.target.geoObjects.add(this.Polyline);

    this.Polyline.editor.startEditing();

    this.Polyline.editor.events.add('drawing', el => {
      console.log(el);

      if (this.Polyline.editor.state.get('drawing') === false) {
        console.log('стопэ');
      }
    });

    this.Polyline.editor.state.set('drawing', true);
  }

  //Настройки пешеходного маршрута
  createPedestrianRouteMap() {
    this.pol.forEach(el => {
      console.log(el);
    });
    this.map.target.geoObjects.removeAll();

    var multiRoute = new ymaps.multiRouter.MultiRoute(
      {
        referencePoints: this.pol,

        params: {
          // Тип маршрута: pedestrian - пешком, auto - на машине, bicycle - на велике.
          routingMode: 'pedestrian',
        },
      },
      {
        //создаем проходные точки
        editorMidPointsType: 'way',
        // Задание внешнего вида начальной точки.
        // wayPointStartIconLayout: "islands#greenStretchyIcon",
        // wayPointStartIconImageHref: "images/myImageStart.png",
        // wayPointStartIconImageSize: [10, 10],
        // wayPointStartIconImageOffset: [-5, -5],
        // Задание внешнего вида конечной точки.
        // wayPointFinishIconLayout: "islands#greenStretchyIcon",
        // wayPointFinishIconImageHref: "images/myImageFinish.png",
        // wayPointFinishIconImageSize: [10, 10],
        // wayPointFinishIconImageOffset: [-5, -5],
        // Задание внешнего вида промежуточной путевой точки.
        wayPointIconLayout: 'default#image',
        // wayPointIconImageHref: "images/myImageWayPoint.png",
        wayPointIconImageSize: [10, 10],
        wayPointIconImageOffset: [-5, -5],
        routeStrokeWidth: 1,
        // editorDrawOver: false,
        balloonLayout: false,
        // wayPointVisible: false,
      }
    );

    multiRoute.editor.start({
      addMidPoints: true,
      addWayPoints: false,
      removeWayPoints: true,
    });
    this.map.target.geoObjects.add(multiRoute);
  }

  //Настройки авто маршрута
  createAutoRouteMap(
    start: ymaps.Placemark,
    coordsStart: number[],
    coordsStop: number[]
  ) {
    var multiRoute = new ymaps.multiRouter.MultiRoute(
      {
        referencePoints: [start.geometry?.getCoordinates()!, coordsStop],
        params: {
          // Тип маршрута: pedestrian - пешком, auto - на машине, bicycle - на велике.
          routingMode: 'auto',
        },
      },
      {
        //создаем проходные точки
        editorMidPointsType: 'via',
        // Задание внешнего вида начальной точки.
        // wayPointStartIconLayout: "islands#greenStretchyIcon",
        // wayPointStartIconImageHref: "images/myImageStart.png",
        // wayPointStartIconImageSize: [10, 10],
        // wayPointStartIconImageOffset: [-5, -5],
        // Задание внешнего вида конечной точки.
        // wayPointFinishIconLayout: "islands#greenStretchyIcon",
        // wayPointFinishIconImageHref: "images/myImageFinish.png",
        // wayPointFinishIconImageSize: [10, 10],
        // wayPointFinishIconImageOffset: [-5, -5],
        // Задание внешнего вида промежуточной путевой точки.
        wayPointIconLayout: 'default#image',
        // wayPointIconImageHref: "images/myImageWayPoint.png",
        wayPointIconImageSize: [10, 10],
        wayPointIconImageOffset: [-5, -5],
        routeStrokeWidth: 1,
        // editorDrawOver: false,
        balloonLayout: false,
        // wayPointVisible: false,
      }
    );

    multiRoute.editor.start({
      addMidPoints: true,
      addWayPoints: false,
      removeWayPoints: true,
    });
    this.map.target.geoObjects.add(multiRoute);
  }
}
