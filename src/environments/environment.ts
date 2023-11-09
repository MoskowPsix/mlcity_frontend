// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiKeyYandex: '3a8040b4-161a-485b-b16e-1968065fb4ac',
  APP_NAME: 'MyLittleCity',
  BASE_URL: 'http://localhost',
  PORT: '8100',
  BACKEND_URL: 'http://localhost',
  BACKEND_PORT: '8000',
  vkontakteAuthUrl: `http://localhost:8000/api/social-auth/vkontakte`,
  vkontakteServiceKey: '7c6d50047c6d50047c6d5004647f7f17fc77c6d7c6d50041fa47869a3cc84a7c0bed429',
  telegramBotName: `PraktZarbot`,
  telegramRedirect: `http://localhost:8000/api/social-auth/telegram/callback`,
  // cityName: 'Заречный',
  // cityRegion: 'Свердловская область',
  // cityCoordsLatitude: 56.81497464978607,
  // cityCoordsLongitude: 61.32053375244141
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
