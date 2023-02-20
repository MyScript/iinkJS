include Makefile.inc

ALL: clean prepare docker test ## (default) Build all and launch test.

.PHONY: ALL purge clean prepare build docker test docs

purge: ## Reset the local directory as if a fresh git checkout was just make.
	@rm -rf node_modules

clean: ## Remove all produced binaries.
	@rm -rf dist
	@rm -rf docs

prepare: ## Install all dependencies.
	@PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install

build: clean ## Building the dist files from sources.
	@npm run build

docs: ## Building the doc files from sources.
	@npm run docs

docker-wait-tcp:
	@cd docker/wait-tcp/ && docker build -t $(WAITTCP_DOCKERREPOSITORY) .

docker-examples: build ## Build the docker image containing last version of myscript-js and examples.
	@rm -rf docker/examples/delivery/
	@mkdir -p docker/examples/delivery
	@cp -R dist docker/examples/delivery/
	@cp -R examples docker/examples/delivery/
	@cp -R node_modules docker/examples/delivery/
	@cd docker/examples/ && \
		docker build \
		--build-arg applicationkey=${DEV_APPLICATIONKEY} \
		--build-arg hmackey=${DEV_HMACKEY} \
		-t $(EXAMPLES_DOCKERREPOSITORY) .

killdocker:
	@docker ps -a | grep "iinkjs-$(DOCKERTAG)-$(BUILDENV)-" | awk '{print $$1}' | xargs -r docker rm -f 2>/dev/null 1>/dev/null || true


local-test-e2e: docker-examples init_examples
	@$(MAKE) BROWSER=$(BROWSER) test-e2e
 
test-e2e: 
	@if [[ $(DEVLOCAL) == true ]]; then \
		EXAMPLES_IP=localhost; \
	else \
		EXAMPLES_IP=$$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $(TEST_DOCKER_EXAMPLES_INSTANCE_NAME)); \
	fi && \
	docker run -i --rm \
		-v $(CURRENT_PWD):/home/pwuser/tests \
		$(DOCKER_EXAMPLES_PARAMETERS) \
		-e LAUNCH_URL="http://$${EXAMPLES_IP}:$(EXAMPLES_LISTEN_PORT)" \
		-e BROWSER=$(BROWSER) \
		-w "/home/pwuser/tests" \
		--name "playwright-$(BROWSER)-$(BUILDID)" mcr.microsoft.com/playwright:v1.16.0 \
		yarn test:e2e

dev-test: docker-examples init_examples ## Launch all the requirements for launching tests

_launch_examples:
	@echo "Starting examples container!"
	@docker run -d \
	  -e "LISTEN_PORT=$(EXAMPLES_LISTEN_PORT)" \
		-e "APISCHEME=$(APISCHEME)" \
		-e "APIHOST=$(APIHOST)" \
		-e "APPLICATIONKEY=$(DEV_APPLICATIONKEY)" \
		-e "HMACKEY=$(DEV_HMACKEY)" \
		$(DOCKER_EXAMPLES_PARAMETERS) \
		--name $(TEST_DOCKER_EXAMPLES_INSTANCE_NAME) $(EXAMPLES_DOCKERREPOSITORY)

_check_examples: 
	@docker run --rm \
		--link $(TEST_DOCKER_EXAMPLES_INSTANCE_NAME):WAITHOST \
		-e "WAIT_PORT=$(EXAMPLES_LISTEN_PORT)" \
		-e "WAIT_SERVICE=Test examples" \
		$(WAITTCP_DOCKERREPOSITORY)
	@echo "Examples started!"

init_examples: _launch_examples _check_examples

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
