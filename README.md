# How to run Docker
## First Step
docker build --pull --rm -f "dockerfile" -t mlcityfrontend:lastest .
## Second Step
docker run -p 8100:80 mlcityfrontend:latest
