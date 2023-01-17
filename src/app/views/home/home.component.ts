import { Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

interface Placemark {
  geometry: number[];
  properties: ymaps.IPlacemarkProperties;
  options: ymaps.IPlacemarkOptions;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
})
export class HomeComponent implements OnInit {
  clustererOptions: ymaps.IClustererOptions = {
    gridSize: 32,
    clusterDisableClickZoom: true,
    preset: 'islands#greenClusterIcons',
  };

  // constructor(private platform: Platform) {
  //   if(this.platform.is('desktop')==true){
  //     alert("Это компуктер");
  //     }else{
  //       alert("Наверное мобильное устройство");
  //  }
  
  // }
  points = [
    [56.831903, 61.411961],
    [56.763338, 61.565466],
    [56.813259, 61.322973],
    [56.817259, 61.32473],
    [56.810259, 61.320973],

  ];
  placemarks: Placemark[] = [];

  ngOnInit() {
    this.points.forEach((geometry, index) => {
      this.placemarks.push({
        geometry,
        properties: {
          hintContent: 'Содержание всплывающей подсказки',
          balloonContent: 'Крутое описание мероприятия',
        },
        options: {
          preset: 'islands#greenDotIcon', //вид иконок, если необходимо будет менять
          iconColor: '#735184', //цвет иконок, если необходимо будет менять
        },
      });
    });
  }

  

}
