# Makefile

DOCKER_COMPOSE := docker compose

all: build

init:
	cp template.env .env
	$(MAKE) build

build:
	$(DOCKER_COMPOSE) up -d --build

stop:
	${DOCKER_COMPOSE} stop

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart: down up

logs:
	$(DOCKER_COMPOSE) logs -f

runlog:
	$(DOCKER_COMPOSE) up --build

prune:
	docker system prune -af

clean-volumes:
	@if [ "`docker volume ls -q`" != "" ]; then \
		docker volume rm `docker volume ls -q`; \
	else \
		echo "No volumes to remove."; \
	fi


fclean: down prune clean-volumes


re: fclean all

.PHONY: all init build up down restart logs prune clean-volumes fclean re
