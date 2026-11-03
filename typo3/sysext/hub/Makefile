.PHONY: help install check lint cgl cgl-fix phpstan phpstan-baseline test test-unit test-functional docs docs-serve e2e-setup e2e clean

# Composer project of the TYPO3 instance the tests run in, with the extension as path repository
SITE := Build/v14
BIN := $(SITE)/vendor/bin
PHP ?= php
CONTAINER ?= $(shell command -v podman 2>/dev/null || echo docker)
# The renderer has its own directory, its dependencies are not those of the extension
GUIDES_RENDERER := .Build/guides-renderer
DOCS_OUTPUT := .Build/Documentation-GENERATED-temp
DOCS_CONFIG := .Build/docs-config
DOCS_PORT ?= 8046
# Its own output per port, as a second render into the same directory would run the finishing step twice
DOCS_SERVE_OUTPUT := .Build/Documentation-serve-$(DOCS_PORT)
E2E_HOST ?= 127.0.0.42:8042
PLAYWRIGHT_IMAGE ?= mcr.microsoft.com/playwright:v1.63.0-noble
# Runs the Playwright tests in Build/playwright, e.g. PLAYWRIGHT='npx playwright test' without container
PLAYWRIGHT ?= $(CONTAINER) run --rm --network host -v "$(CURDIR)":/work:Z -w /work/Build/playwright \
	-e CI -e E2E_BASE_URL $(PLAYWRIGHT_IMAGE) sh -c 'npm ci --no-audit --no-fund && npx playwright test'

export TYPO3_PATH_ROOT := $(CURDIR)/$(SITE)/public
export typo3DatabaseDriver ?= pdo_sqlite

help: ## Show available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: $(SITE)/vendor/autoload.php ## Install composer dependencies

$(SITE)/vendor/autoload.php: composer.json $(SITE)/composer.json
	composer --working-dir=$(SITE) install --no-progress
	@touch $@

check: lint cgl phpstan test ## Run all checks (lint, CGL, PHPStan, unit + functional tests)

lint: install ## Validate composer.json and lint PHP files
	composer validate --no-check-lock
	composer --working-dir=$(SITE) validate --no-check-lock --no-check-publish
	@find Build Classes Configuration src Tests ext_localconf.php -path $(SITE) -prune -o -name '*.php' -print0 | xargs -0 -n1 -P4 $(PHP) -l > /dev/null

cgl: install ## Check coding guidelines (dry-run)
	$(BIN)/php-cs-fixer fix --config Build/php-cs-fixer/config.php --dry-run --diff

cgl-fix: install ## Fix coding guidelines
	$(BIN)/php-cs-fixer fix --config Build/php-cs-fixer/config.php

phpstan: install ## Run PHPStan
	$(BIN)/phpstan analyse -c Build/phpstan/phpstan.neon --no-progress --memory-limit=1G

phpstan-baseline: install ## Regenerate PHPStan baseline
	$(BIN)/phpstan analyse -c Build/phpstan/phpstan.neon --no-progress --memory-limit=1G --generate-baseline=Build/phpstan/phpstan-baseline.neon

test: test-unit test-functional ## Run unit and functional tests

test-unit: install ## Run unit tests
	$(BIN)/phpunit -c Build/phpunit/UnitTests.xml

test-functional: install ## Run functional tests (SQLite by default, see typo3Database* env vars)
	$(BIN)/phpunit -c Build/phpunit/FunctionalTests.xml

$(GUIDES_RENDERER)/vendor/bin/guides: Build/docs/composer.json Build/docs/composer.lock
	composer install --working-dir=Build/docs --no-interaction --no-progress
	@touch $@

docs: install $(GUIDES_RENDERER)/vendor/bin/guides ## Render the documentation with the OpenAPI document and Swagger UI into .Build/Documentation-GENERATED-temp
	rm -rf $(DOCS_OUTPUT)
	Build/docs/config.sh $(DOCS_CONFIG)
	$(GUIDES_RENDERER)/vendor/bin/guides Documentation --config=$(DOCS_CONFIG) --output=$(DOCS_OUTPUT) --fail-on-log --no-progress
	mkdir -p $(DOCS_OUTPUT)/api
	HUB_OPENAPI_OUTPUT=$(CURDIR)/$(DOCS_OUTPUT)/api/openapi.json \
		$(BIN)/phpunit -c Build/phpunit/FunctionalTests.xml --filter OpenApiDocumentTest
	cp Build/swagger/swagger-soul.css Resources/Public/JavaScript/Contrib/swagger-ui-dist.js \
		Resources/Public/Css/Contrib/swagger-ui.css $(DOCS_OUTPUT)/api/
	Build/docs/node.sh $(GUIDES_RENDERER)/vendor/typo3/soul-guides-theme/resources/dist/soul-finish.js $(DOCS_OUTPUT)
	Build/docs/site-css.sh $(DOCS_OUTPUT)
	Build/docs/check.sh $(DOCS_OUTPUT)

# Not the renderer's own `guides serve`: the stylesheet, the script and the fonts
# of the theme come from the finishing step, which it does not run
docs-serve: $(GUIDES_RENDERER)/vendor/bin/guides ## Serve the documentation at DOCS_PORT and render it again on every change
	@GUIDES_RENDERER=$(GUIDES_RENDERER) DOCS_OUTPUT=$(DOCS_SERVE_OUTPUT) DOCS_CONFIG=$(DOCS_CONFIG)-$(DOCS_PORT) DOCS_OPENAPI=$(DOCS_OUTPUT)/api/openapi.json DOCS_PORT=$(DOCS_PORT) PHP=$(PHP) Build/docs/serve.sh

e2e-setup: install ## Set up the TYPO3 instance of the end-to-end tests (Build/v14/config/, Build/v14/var/e2e/)
	PHP=$(PHP) Build/playwright/setup-instance.sh

e2e: e2e-setup ## Run the end-to-end tests with Playwright against the PHP built-in web server
	@TYPO3_PATH_APP=$(CURDIR)/$(SITE) TYPO3_CONTEXT=Development $(PHP) -S $(E2E_HOST) -t $(SITE)/public \
		Build/playwright/router.php > $(SITE)/var/e2e/server.log 2>&1 & pid=$$!; \
	trap "kill $$pid" EXIT; \
	for i in $$(seq 1 50); do curl -sf -o /dev/null http://$(E2E_HOST)/typo3/ && break; sleep 0.2; done; \
	kill -0 $$pid 2>/dev/null || { echo "The web server could not be started, see $(SITE)/var/e2e/server.log"; exit 1; }; \
	cd Build/playwright && E2E_BASE_URL=http://$(E2E_HOST) $(PLAYWRIGHT)

clean: ## Remove build artifacts
	rm -rf .Build $(SITE)/composer.lock $(SITE)/config $(SITE)/public $(SITE)/var $(SITE)/vendor Build/playwright/node_modules
