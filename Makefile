# Paths shannanigans 
MKFILE_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
PROJECT_ROOT := $(dir $(MKFILE_PATH))
SRC_ROOT := ${PROJECT_ROOT}/src

# Build the container for the CLI App
build-cli-app:
	docker build -t cli-app ${PROJECT_ROOT}/app-cli

# Build a native app for the CLI App. Go toolchain is required
# The executable will be generated in the same dir as the code
build-cli-app-native:
	cd ${PROJECT_ROOT}/app-cli && go build && cd -

# Run the cli-app in container
run-cli-app: build-cli-app
	docker run -v ${PROJECT_ROOT}/app-cli/config:/app/config  -it cli-app

# Build all frontend version at once
build-frontends: build-frontend-public build-frontend-auth build-frontend-authkv

# Build the frontend version without any auth whatsoever 
build-frontend-public: 
	cd frontend && npm run build:public && cd -

# Build the frontend version without any auth whatsoever 
build-frontend-auth: 
	cd frontend && npm run build:auth && cd -


# Run the cli-app in container
build-frontend-authkv: 
	cd frontend && npm run build:authkv && cd -

update-actions:
	az staticwebapp secrets list -g demo-bbl-secu -n frontend

deploy-infra:
	cd deploy 
	terraform init
	terraform deploy -f 