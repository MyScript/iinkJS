include Makefile.inc

ALL: clean prepare docker test ## (default) Build all and launch test.

.PHONY: ALL purge clean prepare build docker test docs

purge: ## Reset the local directory as if a fresh git checkout was just make.
	@rm -rf node_modules

clean: ## Remove all produced binaries.
	@rm -rf dist
	@rm -rf docs

prepare: ## Install all dependencies.
	@PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install

build: clean ## Building the dist files from sources.
	@npm run build

docs: ## Building the doc files from sources.
	@npm run docs

docker: build ## Build the docker image containing last version of myscript-js and examples.
	@rm -rf docker/examples/delivery/
	@mkdir -p docker/examples/delivery
	@cp -R dist docker/examples/delivery/
	@cp -R examples docker/examples/delivery/
	@cp -R node_modules docker/examples/delivery/
	@cd docker/examples/ && docker build --build-arg applicationkey=${DEV_APPLICATIONKEY} --build-arg hmackey=${DEV_HMACKEY} $(DOCKER_PARAMETERS) -t $(EXAMPLES_DOCKERREPOSITORY) .

killdocker:
	@docker ps -a | grep "iinkjs-$(DOCKERTAG)-$(BUILDENV)-" | awk '{print $$1}' | xargs -r docker rm -f 2>/dev/null 1>/dev/null || true

test-e2e: killdocker _examples
	docker pull $(PUPPETEER_DOCKERREPOSITORY)
	if [[ $(DEVLOCAL) == true ]]; then \
		EXAMPLES_IP=localhost; \
	else \
		EXAMPLES_IP=$$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $(TEST_DOCKER_EXAMPLES_INSTANCE_NAME)); \
	fi && \
	docker run -i --rm \
		-v $(CURRENT_PWD):/tests \
		-e LAUNCH_URL="http://$${EXAMPLES_IP}:$(EXAMPLES_LISTEN_PORT)" \
		--user=$(CURRENT_USER_UID) \
		--userns=host \
		--net=host \
		$(PUPPETEER_DOCKERREPOSITORY)

dev-all: dev-examples ## Launch all the requirements for launching tests.

dev-examples: _examples ## Launch a local nginx server to ease development.

_examples:
	@echo "Starting examples container!"
	docker run -d --name $(TEST_DOCKER_EXAMPLES_INSTANCE_NAME) $(DOCKER_EXAMPLES_PARAMETERS) \
	  -e "LISTEN_PORT=$(EXAMPLES_LISTEN_PORT)" \
		-e "APISCHEME=$(APISCHEME)" \
		-e "APIHOST=$(APIHOST)" \
        -e "APPLICATIONKEY=$(DEV_APPLICATIONKEY)" \
        -e "HMACKEY=$(DEV_HMACKEY)" \
		$(EXAMPLES_DOCKERREPOSITORY)
	@docker run --rm --link $(TEST_DOCKER_EXAMPLES_INSTANCE_NAME):WAITHOST -e "WAIT_PORT=$(EXAMPLES_LISTEN_PORT)" -e "WAIT_SERVICE=Test examples" $(WAITTCP_DOCKERREPOSITORY)

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
