SHELL := /bin/bash

package:
	$(eval PACKAGE_NAME := $(shell npm pack))
	$(eval MODULE_NAME := $(shell echo $(PACKAGE_NAME) | sed 's/-[^-]*.tgz//g'))
	@echo "$(PACKAGE_NAME)"

publish: package
	@if [ -z "${JFROG_API_KEY}" ]; then >&2 echo "JFROG_API_KEY is required; get it here https://artifactory.reform.hmcts.net/artifactory/webapp/#/profile"; exit 1; fi
	curl -H "X-JFrog-Art-Api: ${JFROG_API_KEY}" -X PUT "https://artifactory.reform.hmcts.net/artifactory/npm-local/$(MODULE_NAME)/-/$(PACKAGE_NAME)" -T $(PACKAGE_NAME)

