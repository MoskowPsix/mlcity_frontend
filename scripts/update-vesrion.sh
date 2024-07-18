platform=$1
version=$(grep )
update_version_url=$(echo "$UPDATE_VERSION_URL")
login='Admin'
password='Qwerty123'

echo "Version: $1
Platform: $2
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
