# bin/bash
platform=$1

update_version_url=$(echo "$UPDATE_VERSION_URL")

login=$(echo "$LOGIN")
password=$(echo "$PASSWORD")

## Получение определенной версии приложения исходя из платформы
if [[ $platform == 'android' ]]; then
  version=$(grep "versionName" ./android/app/build.gradle | cut -d '"' -f 2)
elif [[ $platform == 'ios' ]]; then
  version=$(grep MARKETING_VERSION ./ios/App/App.xcodeproj/project.pbxproj | cut -d ';' -f 1 | cut -d '=' -f 2)
fi



stringarray=($version)
version=${stringarray[0]}
##

echo "Version: $version
Platform: $platform
URL: $update_version_url"

## Получение токена авторизации
response=$(curl --location $update_version_url/login \
  --header 'Accept: application/json' \
  --form 'name="'$login'"' \
  --form 'password="'$password'"'
)

token=$(echo $response | jq -r '.access_token')

echo $token
##

## Обновление версии приложения
version_response=$(curl -X POST $update_version_url/app/$platform/$version \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer '$token
)

echo $version_response
##
