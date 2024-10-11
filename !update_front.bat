@ECHO on
set server=1323900-cn37575.tw1.ru
set password=Admin_MLCity
plink.exe -ssh root@%server% -pw %password% "rm -rf /var/www/mlcity_front/*"
timeout /t 10
pscp.exe -pw %password% -r .\www\ root@%server%:/var/www/mlcity_front/
pause