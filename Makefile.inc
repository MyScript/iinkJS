SHELL = /bin/bash
GIT_VERSION := $(shell git describe --tags --long --always)
CURRENT_USER_UID := $(shell id -u)
CURRENT_USER_GID := $(shell id -g)
CURRENT_PWD := $(shell pwd)

ifeq ($(findstring dev-,$(MAKECMDGOALS)),)
    BUILDID := $(shell date +"%Y-%m-%d_%H_%M_%S_%N")
else
    BUILDID := DEV
endif

FULL = false
OFFLINE = false
IINKAPILOCAL = false
CDKAPILOCAL = false
DEVLOCAL = false
CURRENT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
PROJECT_DIR ?= $(CURRENT_DIR)
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

MAKE := $(MAKE) PROJECT_DIR=$(PROJECT_DIR)  BUILDID=$(BUILDID) --no-print-directory
NPM_CACHE = $(HOME)/.npm

DOCKERTAG := master
GIT_TAG = 2.0.0

REGISTRY = registry.corp.myscript.com:5000
DOC_DOCKERREPOSITORY = $(REGISTRY)/myscriptjs-docs:$(DOCKERTAG)
EXAMPLES_DOCKERREPOSITORY = $(REGISTRY)/myscriptjs-examples:$(DOCKERTAG)

CONFIGURATION_DOCKERTAG := master
MOCHA_DOCKERREPOSITORY = $(REGISTRY)/myscript-webcomponents-mocha:$(CONFIGURATION_DOCKERTAG)
WAITTCP_DOCKERREPOSITORY = $(REGISTRY)/myscript-webcomponents-wait-tcp:$(CONFIGURATION_DOCKERTAG)
PUPPETEER_DOCKERREPOSITORY = $(REGISTRY)/myscript-common-puppeteer:1.0.0

BUILDENV := test
TEST_DOCKER_NAME_PREFIX := myscriptjs-$(DOCKERTAG)-$(BUILDENV)-$(BUILDID)
TEST_DOCKER_EXAMPLES_INSTANCE_NAME := $(TEST_DOCKER_NAME_PREFIX)-examples

APPLICATIONKEY := 7d223f9e-a3cb-4213-ba4b-85e930605f8b
HMACKEY := 5ab1935e-529a-4d48-a695-158450e52b13

APIHOST := cloud-internal-master.corp.myscript.com
APISCHEME := https
ifeq ($(CDKAPILOCAL),true)
    APIHOST := localhost:8894
    APISCHEME := http
endif
ifeq ($(IINKAPILOCAL),true)
   APIHOST := localhost:8897
   APISCHEME := http
endif


ifeq ($(OFFLINE),true)
    NPM_PARAMETERS := --cache-min 9999999
else
    DOCKER_PARAMETERS := --pull
endif

ifeq ($(DEVLOCAL),true)
    DOCKER_EXAMPLES_PARAMETERS := --net=host --userns=host
    EXAMPLES_LISTEN_PORT := 8080
else
    EXAMPLES_LISTEN_PORT := 80
endif
