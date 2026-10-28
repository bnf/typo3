.PHONY: help install check lint cgl cgl-fix phpstan phpstan-baseline test test-unit test-functional docs clean

BIN := .Build/bin
PHP ?= php
CONTAINER ?= $(shell command -v podman 2>/dev/null || echo docker)
RENDER_GUIDES_IMAGE ?= ghcr.io/typo3-documentation/render-guides:latest

export TYPO3_PATH_ROOT := $(CURDIR)/.Build/public
export TYPO3_PATH_APP := $(CURDIR)/.Build
export typo3DatabaseDriver ?= pdo_sqlite

help: ## Show available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: .Build/vendor/autoload.php ## Install composer dependencies

.Build/vendor/autoload.php: composer.json
	composer install --no-progress
	@touch $@

check: lint cgl phpstan test ## Run all checks (lint, CGL, PHPStan, unit + functional tests)

lint: install ## Validate composer.json and lint PHP files
	composer validate --no-check-lock
	@find Build Classes Configuration src Tests ext_localconf.php -name '*.php' -print0 | xargs -0 -n1 -P4 $(PHP) -l > /dev/null

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

docs: ## Render documentation into .Build/Documentation-GENERATED-temp
	rm -rf .Build/Documentation-GENERATED-temp
	$(CONTAINER) run --rm --pull=always -v "$(CURDIR)":/project:Z $(RENDER_GUIDES_IMAGE) \
		--config=Documentation --output=.Build/Documentation-GENERATED-temp --fail-on-log --no-progress

clean: ## Remove build artifacts
	rm -rf .Build composer.lock
