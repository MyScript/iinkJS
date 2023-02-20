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
DOC_DOCKERREPOSITORY = $(REGISTRY)/iinkjs-docs:$(DOCKERTAG)
EXAMPLES_DOCKERREPOSITORY = $(REGISTRY)/iinkjs-examples:$(DOCKERTAG)

CONFIGURATION_DOCKERTAG := 1.0.0
MOCHA_DOCKERREPOSITORY = $(REGISTRY)/iink-js-mocha:$(CONFIGURATION_DOCKERTAG)
WAITTCP_DOCKERREPOSITORY = $(REGISTRY)/iink-js-wait-tcp:$(CONFIGURATION_DOCKERTAG)

BUILDENV := test
TEST_DOCKER_NAME_PREFIX := iinkjs-$(DOCKERTAG)-$(BUILDENV)-$(BUILDID)
TEST_DOCKER_EXAMPLES_INSTANCE_NAME := $(TEST_DOCKER_NAME_PREFIX)-examples

APPLICATIONKEY := 7d223f9e-a3cb-4213-ba4b-85e930605f8b
HMACKEY := 5ab1935e-529a-4d48-a695-158450e52b13

DEV_APPLICATIONKEY := 515131ab-35fa-411c-bb4d-3917e00faf60
DEV_HMACKEY := 54b2ca8a-6752-469d-87dd-553bb450e9ad

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

ifeq ($(DEVLOCAL),true)
    DOCKER_EXAMPLES_PARAMETERS := --net=host --userns=host
    EXAMPLES_LISTEN_PORT := 8080
else
    EXAMPLES_LISTEN_PORT := 80
endif
