IMAGES	:=	postgres front-end back-end

CONTAINERS :=	postgres front-end back-end

PATH_DATA :=	${HOME}/data

all:	build


build_images:
	sudo mkdir -p ${PATH_DATA}/db
	@docker compose  build
	docker image ls

build:
	sudo mkdir -p ${PATH_DATA}/db
	@docker compose  up -d --build
	docker ps

stop:
	@docker compose  stop

down:
	@docker compose  down -v

clean: down stop clean_volumes
	@docker rm -f ${CONTAINERS}
	@docker rmi -f ${IMAGES}
	@docker volume rm -f `docker volume ls`

clean_volumes:
	sudo rm -rf ${PATH_DATA}/db

prune:
	docker container prune -f
	docker image prune -f 
	docker volume prune -f
	docker network prune -f 
	docker system prune -f

re: clean clean_volumes all

.PHONY: all clean re build stop down clean_volumes prune
