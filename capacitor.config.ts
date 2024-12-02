import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'mlcity.ru',
  appName: 'Вокруг: События рядом',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: 'https://vokrug.city',
  },
}

export default config
