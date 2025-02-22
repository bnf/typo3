#!/usr/bin/env bash

#
# TYPO3 core test runner based on docker or podman
#
if [ "${CI}" != "true" ]; then
    trap 'echo "runTests.sh SIGINT signal emitted";cleanUp;exit 2' SIGINT
fi

waitFor() {
    local HOST=${1}
    local PORT=${2}
    local TESTCOMMAND="
        COUNT=0;
        while ! nc -z ${HOST} ${PORT}; do
            if [ \"\${COUNT}\" -gt 10 ]; then
              echo \"Can not connect to ${HOST} port ${PORT}. Aborting.\";
              exit 1;
            fi;
            sleep 1;
            COUNT=\$((COUNT + 1));
        done;
    "
    ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name wait-for-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_ALPINE} /bin/sh -c "${TESTCOMMAND}"
    if [[ $? -gt 0 ]]; then
        kill -SIGINT -$$
    fi
}

cleanUp() {
    echo "Remove container for network \"${NETWORK}\""
    ATTACHED_CONTAINERS=$(${CONTAINER_BIN} ps --filter network=${NETWORK} --format='{{.Names}}')
    for ATTACHED_CONTAINER in ${ATTACHED_CONTAINERS}; do
        ${CONTAINER_BIN} kill ${ATTACHED_CONTAINER} >/dev/null
    done
    if [ ${CONTAINER_BIN} = "docker" ]; then
        ${CONTAINER_BIN} network rm ${NETWORK} >/dev/null
    else
        ${CONTAINER_BIN} network rm -f ${NETWORK} >/dev/null
    fi
}

handleDbmsOptions() {
    # -a, -d, -i depend on each other. Validate input combinations and set defaults.
    case ${DBMS} in
        mariadb)
            [ -z "${DATABASE_DRIVER}" ] && DATABASE_DRIVER="mysqli"
            if [ "${DATABASE_DRIVER}" != "mysqli" ] && [ "${DATABASE_DRIVER}" != "pdo_mysql" ]; then
                echo "Invalid combination -d ${DBMS} -a ${DATABASE_DRIVER}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            [ -z "${DBMS_VERSION}" ] && DBMS_VERSION="10.3"
            if ! [[ ${DBMS_VERSION} =~ ^(10.1|10.2|10.3|10.4|10.5|10.6|10.7|10.8|10.9|10.10|10.11|11.0|11.1|11.2|11.3|11.4)$ ]]; then
                echo "Invalid combination -d ${DBMS} -i ${DBMS_VERSION}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            ;;
        mysql)
            [ -z "${DATABASE_DRIVER}" ] && DATABASE_DRIVER="mysqli"
            if [ "${DATABASE_DRIVER}" != "mysqli" ] && [ "${DATABASE_DRIVER}" != "pdo_mysql" ]; then
                echo "Invalid combination -d ${DBMS} -a ${DATABASE_DRIVER}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            [ -z "${DBMS_VERSION}" ] && DBMS_VERSION="5.5"
            if ! [[ ${DBMS_VERSION} =~ ^(5.5|5.6|5.7|8.0|8.1|8.2|8.3|8.4)$ ]]; then
                echo "Invalid combination -d ${DBMS} -i ${DBMS_VERSION}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            ;;
        mssql)
            [ -z ${DATABASE_DRIVER} ] && DATABASE_DRIVER="sqlsrv"
            if [ "${DATABASE_DRIVER}" != "sqlsrv" ] && [ "${DATABASE_DRIVER}" != "pdo_sqlsrv" ]; then
                echo "Invalid option -a ${DATABASE_DRIVER} with -d ${DBMS}" >&2
                echo >&2
                echo "call \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            ;;
        postgres)
            if [ -n "${DATABASE_DRIVER}" ]; then
                echo "Invalid combination -d ${DBMS} -a ${DATABASE_DRIVER}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            [ -z "${DBMS_VERSION}" ] && DBMS_VERSION="10"
            if ! [[ ${DBMS_VERSION} =~ ^(9.6|10|11|12|13|14|15|16)$ ]]; then
                echo "Invalid combination -d ${DBMS} -i ${DBMS_VERSION}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            ;;
        sqlite)
            if [ -n "${DATABASE_DRIVER}" ]; then
                echo "Invalid combination -d ${DBMS} -a ${DATABASE_DRIVER}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            if [ -n "${DBMS_VERSION}" ]; then
                echo "Invalid combination -d ${DBMS} -i ${DATABASE_DRIVER}" >&2
                echo >&2
                echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
                exit 1
            fi
            ;;
        *)
            echo "Invalid option -d ${DBMS}" >&2
            echo >&2
            echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
            exit 1
            ;;
    esac
}

cleanBuildFiles() {
    echo -n "Clean builds ... "
    rm -rf \
        Build/JavaScript \
        Build/node_modules
    echo "done"
}

cleanCacheFiles() {
    echo -n "Clean caches ... "
    rm -rf \
        .cache \
        Build/.cache \
        Build/composer/.cache/ \
        .php-cs-fixer.cache
    echo "done"
}

cleanTestFiles() {
    # composer distribution test
    echo -n "Clean composer distribution test ... "
    rm -rf \
        Build/composer/composer.json \
        Build/composer/composer.lock \
        Build/composer/public/index.php \
        Build/composer/public/typo3 \
        Build/composer/public/typo3conf/ext \
        Build/composer/var/ \
        Build/composer/vendor/
    echo "done"

    # test related
    echo -n "Clean test related files ... "
    rm -rf \
        Build/phpunit/FunctionalTests-Job-*.xml \
        typo3/sysext/core/Tests/AcceptanceTests-Job-* \
        typo3/sysext/core/Tests/Acceptance/Support/_generated \
        typo3temp/var/tests/
    echo "done"
}

cleanRenderedDocumentationFiles() {
    echo -n "Clean rendered documentation files ... "
    rm -rf \
        typo3/sysext/*/Documentation-GENERATED-temp
    echo "done"
}

getPhpImageVersion() {
    case ${1} in
        7.4)
            echo -n "2.8"
            ;;
        8.0)
            echo -n "2.8"
            ;;
        8.1)
            echo -n "2.12"
            ;;
        8.2)
            echo -n "1.12"
            ;;
        8.3)
            echo -n "1.13"
            ;;
        8.4)
            echo -n "1.2"
            ;;
    esac
}

loadHelp() {
    # Load help text into $HELP
    read -r -d '' HELP <<EOF
TYPO3 core test runner. Execute acceptance, unit, functional and other test suites in
a container based test environment. Handles execution of single test files, sending
xdebug information to a local IDE and more.

Usage: $0 [options] [file]

Options:
    -s <...>
        Specifies the test suite to run
            - acceptance: main application acceptance tests
            - acceptanceComposer: main application acceptance tests
            - acceptanceInstall: installation acceptance tests, only with -d mariadb|postgres|sqlite
            - buildCss: execute scss to css builder
            - buildJavascript: execute typescript to javascript builder
            - cgl: test and fix all core php files
            - cglGit: test and fix latest committed patch for CGL compliance
            - cglHeader: test and fix file header for all core php files
            - cglHeaderGit: test and fix latest committed patch for CGL file header compliance
            - checkAnnotations: check php code for allowed annotations
            - checkBom: check UTF-8 files do not contain BOM
            - checkComposer: check composer.json files for version integrity
            - checkExceptionCodes: test core for duplicate exception codes
            - checkExtensionScannerRst: test all .rst files referenced by extension scanner exist
            - checkFilePathLength: test core file paths do not exceed maximum length
            - checkFilesAndPathsForSpaces: test paths and files for spaces
            - checkGitSubmodule: test core git has no sub modules defined
            - checkGruntClean: Verify "grunt build" is clean. Warning: Executes git commands! Usually used in CI only.
            - checkNamespaceIntegrity: Verify namespace integrity in class and test code files are in good shape.
            - checkPermissions: test some core files for correct executable bits
            - checkRst: test .rst files for integrity
            - checkTestMethodsPrefix: check tests methods do not start with "test"
            - clean: clean up build, cache and testing related files and folders
            - cleanBuild: clean up build related files and folders
            - cleanCache: clean up cache related files and folders
            - cleanRenderedDocumentation: clean up rendered documentation files and folders (Documentation-GENERATED-temp)
            - cleanTests: clean up test related files and folders
            - composer: "composer" command dispatcher, to execute various composer commands
            - composerInstall: "composer install"
            - composerInstallMax: "composer update", with no platform.php config.
            - composerInstallMin: "composer update --prefer-lowest", with platform.php set to PHP version x.x.0.
            - composerTestDistribution: "composer update" in Build/composer to verify core dependencies
            - composerValidate: "composer validate"
            - functional: PHP functional tests
            - functionalDeprecated: deprecated PHP functional tests
            - listExceptionCodes: list core exception codes in JSON format
            - lintHtml: HTML linting
            - lintPhp: PHP linting
            - lintScss: SCSS linting
            - lintServicesYaml: YAML Linting Services.yaml files with enabled tags parsing.
            - lintTypescript: TS linting
            - lintYaml: YAML Linting (excluding Services.yaml)
            - npm: "npm" command dispatcher, to execute various npm commands directly
            - phpstan: phpstan tests
            - phpstanGenerateBaseline: regenerate phpstan baseline, handy after phpstan updates
            - unit (default): PHP unit tests
            - unitDeprecated: deprecated PHP unit tests
            - unitJavascript: JavaScript unit tests
            - unitRandom: PHP unit tests in random order, "-- --random-order-seed=<number>" to use specific seed

    -b <docker|podman>
        Container environment:
            - podman (default)
            - docker

    -a <mysqli|pdo_mysql|sqlsrv|pdo_sqlsrv>
        Only with -s functional|functionalDeprecated
        Specifies to use another driver, following combinations are available:
            - mysql
                - mysqli (default)
                - pdo_mysql
            - mariadb
                - mysqli (default)
                - pdo_mysql
            - mssql
                - sqlsrv (default)
                - pdo_sqlsrv

    -d <sqlite|mariadb|mysql|postgres|mssql>
        Only with -s functional|functionalDeprecated|acceptance|acceptanceComposer|acceptanceInstall
        Specifies on which DBMS tests are performed
            - sqlite: (default): use sqlite
            - mariadb: use mariadb
            - mysql: use MySQL
            - postgres: use postgres
            - mssql: use mssql

    -i version
        Specify a specific database version
        With "-d mariadb":
            - 10.1   short-term, no longer maintained
            - 10.2   short-term, no longer maintained
            - 10.3   short-term, maintained until 2023-05-25 (default)
            - 10.4   short-term, maintained until 2024-06-18
            - 10.5   short-term, maintained until 2025-06-24
            - 10.6   long-term, maintained until 2026-06
            - 10.7   short-term, no longer maintained
            - 10.8   short-term, maintained until 2023-05
            - 10.9   short-term, maintained until 2023-08
            - 10.10  short-term, maintained until 2023-11
            - 10.11  long-term, maintained until 2028-02
            - 11.0   development series
            - 11.1   short-term development series, maintained until 2024-08
            - 11.2   short-term development series, maintained until 2024-11
            - 11.3   short-term development series, rolling release
            - 11.4   long-term, maintained until 2029-05
        With "-d mysql":
            - 5.5   unmaintained since 2018-12 (default)
            - 5.6   unmaintained since 2021-02
            - 5.7   maintained until 2023-10
            - 8.0   maintained until 2026-04
            - 8.1   unmaintained since 2023-10
            - 8.2   unmaintained since 2024-01
            - 8.3   maintained until 2024-04
            - 8.4   maintained until 2032-04 LTS
        With "-d postgres":
            - 9.6   unmaintained since 2021-11-11
            - 10    unmaintained since 2022-11-10 (default)
            - 11    unmaintained since 2023-11-09
            - 12    maintained until 2024-11-14
            - 13    maintained until 2025-11-13
            - 14    maintained until 2026-11-12
            - 15    maintained until 2027-11-11
            - 16    maintained until 2028-11-09

    -c <chunk/numberOfChunks>
        Only with -s functional|acceptance
        Hack functional or acceptance tests into #numberOfChunks pieces and run tests of #chunk.
        Example -c 3/13

    -p <7.4|8.0|8.1|8.2|8.3|8.4>
        Specifies the PHP minor version to be used
            - 7.4: (default) use PHP 7.4
            - 8.0: use PHP 8.0
            - 8.1: use PHP 8.1
            - 8.2: use PHP 8.2
            - 8.3: use PHP 8.3
            - 8.4: use PHP 8.4

    -g
        Only with -s acceptance|acceptanceComposer|acceptanceInstall
        Activate selenium grid as local port to watch browser clicking around. Can be surfed using
        http://localhost:7900/. A browser tab is opened automatically if xdg-open is installed.

    -x
        Only with -s functional|functionalDeprecated|unit|unitDeprecated|unitRandom|acceptance|acceptanceComposer|acceptanceInstall
        Send information to host instance for test or system under test break points. This is especially
        useful if a local PhpStorm instance is listening on default xdebug port 9003. A different port
        can be selected with -y

    -y <port>
        Send xdebug information to a different port than default 9003 if an IDE like PhpStorm
        is not listening on default port.

    -n
        Only with -s cgl|cglGit|cglHeader|cglHeaderGit
        Activate dry-run in CGL check that does not actively change files and only prints broken ones.

    -u
        Update existing typo3/core-testing-* container images and remove obsolete dangling image versions.
        Use this if weird test errors occur.

    -h
        Show this help.

Examples:
    # Run all core unit tests using PHP 7.4
    ./Build/Scripts/runTests.sh
    ./Build/Scripts/runTests.sh -s unit

    # Run all core units tests and enable xdebug (have a PhpStorm listening on port 9003!)
    ./Build/Scripts/runTests.sh -x

    # Run unit tests in phpunit with xdebug on PHP 8.0 and filter for test filterByValueRecursiveCorrectlyFiltersArray
    ./Build/Scripts/runTests.sh -x -p 8.0 -- --filter filterByValueRecursiveCorrectlyFiltersArray

    # Run functional tests in phpunit with a filtered test method name in a specified file
    ./Build/Scripts/runTests.sh -s functional -- --filter aTestName path/to/fileTest.php

    # Run unit tests with PHP 8.0 and have xdebug enabled
    ./Build/Scripts/runTests.sh -x -p 8.0

    # Run functional tests on postgres with xdebug, php 8.0 and execute a restricted set of tests
    ./Build/Scripts/runTests.sh -x -p 8.0 -s functional -d postgres typo3/sysext/core/Tests/Functional/Authentication

    # Run functional tests on mariadb 10.5
    ./Build/Scripts/runTests.sh -d mariadb -i 10.5

    # Run functional tests on postgres 11
    ./Build/Scripts/runTests.sh -s functional -d postgres -i 11

    # Run restricted set of application acceptance tests
    ./Build/Scripts/runTests.sh -s acceptance typo3/sysext/core/Tests/Acceptance/Application/Login/BackendLoginCest.php:loginButtonMouseOver

    # Run installer tests of a new instance on sqlite
    ./Build/Scripts/runTests.sh -s acceptanceInstall -d sqlite

    # Run composer require to require a dependency
    ./Build/Scripts/runTests.sh -s composer -- require --dev typo3/testing-framework:dev-main

    # Some composer command examples
    ./Build/Scripts/runTests.sh -s composer -- dumpautoload
    ./Build/Scripts/runTests.sh -s composer -- info | grep "symfony"

    # Some npm command examples
    ./Build/Scripts/runTests.sh -s npm -- audit
    ./Build/Scripts/runTests.sh -s npm -- ci
    ./Build/Scripts/runTests.sh -s npm -- run build
    ./Build/Scripts/runTests.sh -s npm -- run watch:build
    ./Build/Scripts/runTests.sh -s npm -- install --save bootstrap@^5.3.2
EOF
}

# Test if docker exists, else exit out with error
if ! type "docker" >/dev/null 2>&1 && ! type "podman" >/dev/null 2>&1; then
    echo "This script relies on docker or podman. Please install" >&2
    exit 1
fi

# Go to the directory this script is located, so everything else is relative
# to this dir, no matter from where this script is called, then go up two dirs.
THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
cd "$THIS_SCRIPT_DIR" || exit 1
cd ../../ || exit 1
CORE_ROOT="${PWD}"

# Default variables
TEST_SUITE="unit"
DBMS="sqlite"
DBMS_VERSION=""
PHP_VERSION="7.4"
PHP_XDEBUG_ON=0
PHP_XDEBUG_PORT=9003
ACCEPTANCE_HEADLESS=1
CGLCHECK_DRY_RUN=""
DATABASE_DRIVER=""
CHUNKS=0
THISCHUNK=0
CONTAINER_BIN=""
COMPOSER_ROOT_VERSION="11.5.x-dev"
PHPSTAN_CONFIG_FILE="phpstan.local.neon"
CONTAINER_INTERACTIVE="-it --init"
HOST_UID=$(id -u)
HOST_PID=$(id -g)
USERSET=""
CI_PARAMS="${CI_PARAMS:-}"
CI_JOB_ID=${CI_JOB_ID:-}
SUFFIX=$(echo $RANDOM)
if [ ${CI_JOB_ID} ]; then
    SUFFIX="${CI_JOB_ID}-${SUFFIX}"
fi
NETWORK="typo3-core-${SUFFIX}"
CONTAINER_HOST="host.docker.internal"

# Option parsing updates above default vars
# Reset in case getopts has been used previously in the shell
OPTIND=1
# Array for invalid options
INVALID_OPTIONS=()
# Simple option parsing based on getopts (! not getopt)
while getopts ":a:b:s:c:d:i:p:xy:nhug" OPT; do
    case ${OPT} in
        s)
            TEST_SUITE=${OPTARG}
            ;;
        b)
            if ! [[ ${OPTARG} =~ ^(docker|podman)$ ]]; then
                INVALID_OPTIONS+=("${OPTARG}")
            fi
            CONTAINER_BIN=${OPTARG}
            ;;
        a)
            DATABASE_DRIVER=${OPTARG}
            ;;
        c)
            if ! [[ ${OPTARG} =~ ^([0-9]+\/[0-9]+)$ ]]; then
                INVALID_OPTIONS+=("${OPTARG}")
            else
                # Split "2/13" - run chunk 2 of 13 chunks
                THISCHUNK=$(echo "${OPTARG}" | cut -d '/' -f1)
                CHUNKS=$(echo "${OPTARG}" | cut -d '/' -f2)
            fi
            ;;
        d)
            DBMS=${OPTARG}
            ;;
        i)
            DBMS_VERSION=${OPTARG}
            ;;
        p)
            PHP_VERSION=${OPTARG}
            if ! [[ ${PHP_VERSION} =~ ^(7.4|8.0|8.1|8.2|8.3|8.4)$ ]]; then
                INVALID_OPTIONS+=("${OPTARG}")
            fi
            ;;
        g)
            ACCEPTANCE_HEADLESS=0
            ;;
        x)
            PHP_XDEBUG_ON=1
            ;;
        y)
            PHP_XDEBUG_PORT=${OPTARG}
            ;;
        n)
            CGLCHECK_DRY_RUN="-n"
            ;;
        h)
            loadHelp
            echo "${HELP}"
            exit 0
            ;;
        u)
            TEST_SUITE=update
            ;;
        \?)
            INVALID_OPTIONS+=("${OPTARG}")
            ;;
        :)
            INVALID_OPTIONS+=("${OPTARG}")
            ;;
    esac
done

# Exit on invalid options
if [ ${#INVALID_OPTIONS[@]} -ne 0 ]; then
    echo "Invalid option(s):" >&2
    for I in "${INVALID_OPTIONS[@]}"; do
        echo "-"${I} >&2
    done
    echo >&2
    echo "Use \".Build/Scripts/runTests.sh -h\" to display help and valid options" >&2
    exit 1
fi

handleDbmsOptions

# ENV var "CI" is set by gitlab-ci. Use it to force some CI details.
if [ "${CI}" == "true" ]; then
    PHPSTAN_CONFIG_FILE="phpstan.ci.neon"
    CONTAINER_INTERACTIVE=""
fi

# determine default container binary to use: 1. podman 2. docker
if [[ -z "${CONTAINER_BIN}" ]]; then
    if type "podman" >/dev/null 2>&1; then
        CONTAINER_BIN="podman"
    elif type "docker" >/dev/null 2>&1; then
        CONTAINER_BIN="docker"
    fi
fi

if [ $(uname) != "Darwin" ] && [ ${CONTAINER_BIN} = "docker" ]; then
    # Run docker jobs as current user to prevent permission issues. Not needed with podman.
    USERSET="--user $HOST_UID"
fi

if ! type ${CONTAINER_BIN} >/dev/null 2>&1; then
    echo "Selected container environment \"${CONTAINER_BIN}\" not found. Please install or use -b option to select one." >&2
    exit 1
fi

IMAGE_PHP="ghcr.io/typo3/core-testing-$(echo "php${PHP_VERSION}" | sed -e 's/\.//'):$(getPhpImageVersion $PHP_VERSION)"
IMAGE_NODEJS="ghcr.io/typo3/core-testing-js:1.4"
IMAGE_NODEJS_CHROME="ghcr.io/typo3/core-testing-js-chrome:1.4"
IMAGE_ALPINE="docker.io/alpine:3.8"
IMAGE_SELENIUM="docker.io/selenium/standalone-chrome:4.0.0-20211102"
IMAGE_REDIS="docker.io/redis:4-alpine"
IMAGE_MEMCACHED="docker.io/memcached:1.5-alpine"
IMAGE_MARIADB="docker.io/mariadb:${DBMS_VERSION}"
IMAGE_MYSQL="docker.io/mysql:${DBMS_VERSION}"
IMAGE_POSTGRES="docker.io/postgres:${DBMS_VERSION}-alpine"

# Detect arm64 to use seleniarm image.
ARCH=$(uname -m)
if [ ${ARCH} = "arm64" ]; then
    IMAGE_SELENIUM="docker.io/seleniarm/standalone-chromium:4.1.2-20220227"
fi

# Remove handled options and leaving the rest in the line, so it can be passed raw to commands
shift $((OPTIND - 1))

# Create .cache dir: composer and various npm jobs need this.
mkdir -p .cache
mkdir -p typo3temp/var/tests

${CONTAINER_BIN} network create ${NETWORK} >/dev/null

COMPOSER_IGNORE_PLATFORM_REQ=""
if [ "${PHP_VERSION}" = "8.3" ]; then
    COMPOSER_IGNORE_PLATFORM_REQ="--ignore-platform-req=php+"
fi

if [ ${CONTAINER_BIN} = "docker" ]; then
    # docker needs the add-host for xdebug remote debugging. podman has host.container.internal built in
    CONTAINER_COMMON_PARAMS="${CONTAINER_INTERACTIVE} --rm --network ${NETWORK} --add-host "${CONTAINER_HOST}:host-gateway" ${USERSET} -v ${CORE_ROOT}:${CORE_ROOT} -w ${CORE_ROOT}"
else
    # podman
    CONTAINER_HOST="host.containers.internal"
    CONTAINER_COMMON_PARAMS="${CONTAINER_INTERACTIVE} ${CI_PARAMS} --rm --network ${NETWORK} -v ${CORE_ROOT}:${CORE_ROOT} -w ${CORE_ROOT}"
fi

if [[ "${CI}" == "true" ]]; then
    CONTAINER_COMMON_PARAMS="${CONTAINER_COMMON_PARAMS} --add-host \"repo.packagist.org:146.59.12.218\"  --add-host \"github.com:140.82.121.3\" --add-host \"api.github.com:140.82.121.6\""
fi

if [ ${PHP_XDEBUG_ON} -eq 0 ]; then
    XDEBUG_MODE="-e XDEBUG_MODE=off"
    XDEBUG_CONFIG=" "
else
    XDEBUG_MODE="-e XDEBUG_MODE=debug -e XDEBUG_TRIGGER=foo"
    XDEBUG_CONFIG="client_port=${PHP_XDEBUG_PORT} client_host=${CONTAINER_HOST}"
fi

# Suite execution
case ${TEST_SUITE} in
    acceptance)
        CODECEPION_ENV="--env ci,classic"
        if [ "${ACCEPTANCE_HEADLESS}" -eq 1 ]; then
            CODECEPION_ENV="--env ci,classic,headless"
        fi
        if [ "${CHUNKS}" -gt 0 ]; then
            ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-splitter-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/splitAcceptanceTests.php -v ${CHUNKS}
            COMMAND=(bin/codecept run Application -d -g AcceptanceTests-Job-${THISCHUNK} -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} "$@" --html reports.html)
        else
            COMMAND=(bin/codecept run Application -d -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} "$@" --html reports.html)
        fi
        SELENIUM_GRID=""
        if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ]; then
            SELENIUM_GRID="-p 7900:7900 -e SE_VNC_NO_PASSWORD=1 -e VNC_NO_PASSWORD=1"
        fi
        ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d ${SELENIUM_GRID} --name ac-chrome-${SUFFIX} --network ${NETWORK} --network-alias chrome --tmpfs /dev/shm:rw,nosuid,nodev,noexec ${IMAGE_SELENIUM} >/dev/null
        if [ ${CONTAINER_BIN} = "docker" ]; then
            ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d --name ac-web-${SUFFIX} --network ${NETWORK} --network-alias web --add-host "${CONTAINER_HOST}:host-gateway" ${USERSET} -v ${CORE_ROOT}:${CORE_ROOT} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} php -S web:8000 -t ${CORE_ROOT} >/dev/null
        else
            ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d --name ac-web-${SUFFIX} --network ${NETWORK} --network-alias web -v ${CORE_ROOT}:${CORE_ROOT} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} php -S web:8000 -t ${CORE_ROOT} >/dev/null
        fi
        waitFor chrome 4444
        if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ]; then
            waitFor chrome 7900
        fi
        waitFor web 8000
        if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ] && type "xdg-open" >/dev/null; then
            xdg-open http://localhost:7900/?autoconnect=1 >/dev/null
        elif [ "${ACCEPTANCE_HEADLESS}" -eq 0 ] && type "open" >/dev/null; then
            open http://localhost:7900/?autoconnect=1 >/dev/null
        fi
        case ${DBMS} in
            mariadb)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mariadb-ac-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MARIADB} >/dev/null
                DATABASE_IP=$(${CONTAINER_BIN} inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mariadb-ac-${SUFFIX})
                waitFor mariadb-ac-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3DatabaseName=func_test -e typo3DatabaseUsername=root -e typo3DatabasePassword=funcp -e typo3DatabaseHost=${DATABASE_IP}"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-mariadb ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            mysql)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mysql-ac-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MYSQL} >/dev/null
                DATABASE_IP=$(${CONTAINER_BIN} inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mysql-ac-${SUFFIX})
                waitFor mysql-ac-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3DatabaseName=func_test -e typo3DatabaseUsername=root -e typo3DatabasePassword=funcp -e typo3DatabaseHost=${DATABASE_IP}"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-mysql ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            postgres)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name postgres-ac-${SUFFIX} --network ${NETWORK} -d -e POSTGRES_PASSWORD=funcp -e POSTGRES_USER=funcu --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid ${IMAGE_POSTGRES} >/dev/null
                DATABASE_IP=$(${CONTAINER_BIN} inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres-ac-${SUFFIX})
                waitFor postgres-ac-${SUFFIX} 5432
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_pgsql -e typo3DatabaseName=func_test -e typo3DatabaseUsername=funcu -e typo3DatabasePassword=funcp -e typo3DatabaseHost=${DATABASE_IP}"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-postgres ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            sqlite)
                rm -rf "${CORE_ROOT}/typo3temp/var/tests/acceptance-sqlite-dbs/"
                mkdir -p "${CORE_ROOT}/typo3temp/var/tests/acceptance-sqlite-dbs/"
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_sqlite"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-sqlite ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
        esac
        ;;
    acceptanceComposer)
        rm -rf "${CORE_ROOT}/typo3temp/var/tests/acceptance-composer" "${CORE_ROOT}/typo3temp/var/tests/AcceptanceReports"

        PREPAREPARAMS=""
        TESTPARAMS=""
        case ${DBMS} in
            mariadb)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mariadb-ac-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=acp -e MYSQL_DATABASE=ac_test --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MARIADB} >/dev/null
                waitFor mariadb-ac-${SUFFIX} 3306
                PREPAREPARAMS="-e TYPO3_INSTALL_DB_DRIVER=mysqli -e TYPO3_INSTALL_DB_DBNAME=ac_test -e TYPO3_INSTALL_DB_USER=root -e TYPO3_INSTALL_DB_PASSWORD=acp -e TYPO3_INSTALL_DB_HOST=mariadb-ac-${SUFFIX} -e TYPO3_INSTALL_DB_PORT=3306 -e TYPO3_INSTALL_DB_USE_EXISTING=1"
                TESTPARAMS="-e typo3DatabaseName=ac_test -e typo3DatabaseUsername=root -e typo3DatabasePassword=funcp -e typo3DatabaseHost=mariadb-ac-${SUFFIX}"
                ;;
            mysql)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mysql-ac-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=acp -e MYSQL_DATABASE=ac_test --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MYSQL} >/dev/null
                waitFor mysql-ac-${SUFFIX} 3306
                PREPAREPARAMS="-e TYPO3_INSTALL_DB_DRIVER=mysqli -e TYPO3_INSTALL_DB_DBNAME=ac_test -e TYPO3_INSTALL_DB_USER=root -e TYPO3_INSTALL_DB_PASSWORD=acp -e TYPO3_INSTALL_DB_HOST=mysql-ac-${SUFFIX} -e TYPO3_INSTALL_DB_PORT=3306 -e TYPO3_INSTALL_DB_USE_EXISTING=1"
                TESTPARAMS="-e typo3DatabaseName=ac_test -e typo3DatabaseUsername=root -e typo3DatabasePassword=funcp -e typo3DatabaseHost=mysql-ac-${SUFFIX}"
                ;;
            postgres)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name postgres-ac-${SUFFIX} --network ${NETWORK} -d -e POSTGRES_DB=ac_test -e POSTGRES_PASSWORD=acp -e POSTGRES_USER=ac_test --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid ${IMAGE_POSTGRES} >/dev/null
                waitFor postgres-ac-${SUFFIX} 5432
                PREPAREPARAMS="-e TYPO3_INSTALL_DB_DRIVER=pdo_pgsql -e TYPO3_INSTALL_DB_DBNAME=ac_test -e TYPO3_INSTALL_DB_USER=ac_test -e TYPO3_INSTALL_DB_PASSWORD=acp -e TYPO3_INSTALL_DB_HOST=postgres-ac-${SUFFIX} -e TYPO3_INSTALL_DB_PORT=5432 -e TYPO3_INSTALL_DB_USE_EXISTING=1"
                TESTPARAMS="-e typo3DatabaseDriver=pdo_pgsql -e typo3DatabaseName=ac_test -e typo3DatabaseUsername=ac_test -e typo3DatabasePassword=acp -e typo3DatabaseHost=postgres-ac-${SUFFIX}"
                ;;
            sqlite)
                PREPAREPARAMS="-e TYPO3_INSTALL_DB_DRIVER=pdo_sqlite"
                TESTPARAMS="-e typo3DatabaseDriver=pdo_sqlite"
                ;;
        esac

        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name acceptance-prepare ${XDEBUG_MODE} -e COMPOSER_CACHE_DIR=${CORE_ROOT}/.cache/composer -e COMPOSER_ROOT_VERSION=${COMPOSER_ROOT_VERSION} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${PREPAREPARAMS} ${IMAGE_PHP} "${CORE_ROOT}/Build/Scripts/setupAcceptanceComposer.sh" "typo3temp/var/tests/acceptance-composer"
        SUITE_EXIT_CODE=$?
        if [[ ${SUITE_EXIT_CODE} -eq 0 ]]; then
            CODECEPION_ENV="--env ci,composer"
            if [ "${ACCEPTANCE_HEADLESS}" -eq 1 ]; then
                CODECEPION_ENV="--env ci,composer,headless"
            fi
            if [ "${CHUNKS}" -gt 0 ]; then
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-splitter-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/splitAcceptanceTests.php -v ${CHUNKS}
                COMMAND=(bin/codecept run Application -d -g AcceptanceTests-Job-${THISCHUNK} -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} "$@" --html reports.html)
            else
                COMMAND=(bin/codecept run Application -d -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} "$@" --html reports.html)
            fi

            SELENIUM_GRID=""
            if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ]; then
                SELENIUM_GRID="-p 7900:7900 -e SE_VNC_NO_PASSWORD=1 -e VNC_NO_PASSWORD=1"
            fi
            ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d ${SELENIUM_GRID} --name ac-chrome-${SUFFIX} --network ${NETWORK} --network-alias chrome --tmpfs /dev/shm:rw,nosuid,nodev,noexec ${IMAGE_SELENIUM} >/dev/null
            if [ ${CONTAINER_BIN} = "docker" ]; then
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d --name ac-web-${SUFFIX} --network ${NETWORK} --network-alias web --add-host "${CONTAINER_HOST}:host-gateway" ${USERSET} -v ${CORE_ROOT}:${CORE_ROOT} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} php -S web:8000 -t ${CORE_ROOT}/typo3temp/var/tests/acceptance-composer/public >/dev/null
            else
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d --name ac-web-${SUFFIX} --network ${NETWORK} --network-alias web -v ${CORE_ROOT}:${CORE_ROOT} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} php -S web:8000 -t ${CORE_ROOT}/typo3temp/var/tests/acceptance-composer/public >/dev/null
            fi

            waitFor chrome 4444
            if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ]; then
                waitFor chrome 7900
            fi
            waitFor web 8000
            if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ] && type "xdg-open" >/dev/null; then
                xdg-open http://localhost:7900/?autoconnect=1 >/dev/null
            elif [ "${ACCEPTANCE_HEADLESS}" -eq 0 ] && type "open" >/dev/null; then
                open http://localhost:7900/?autoconnect=1 >/dev/null
            fi

            ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-${DBMS}-composer ${XDEBUG_MODE} -e typo3TestingAcceptanceBaseUrl="http://web:8000/" -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${TESTPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
            SUITE_EXIT_CODE=$?
        fi
        ;;
    acceptanceInstall)
        SELENIUM_GRID=""
        if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ]; then
            SELENIUM_GRID="-p 7900:7900 -e SE_VNC_NO_PASSWORD=1 -e VNC_NO_PASSWORD=1"
        fi
        if [ ${CONTAINER_BIN} = "docker" ]; then
            ${CONTAINER_BIN} run --rm -d ${SELENIUM_GRID} --name ac-install-chrome-${SUFFIX} --network ${NETWORK} --network-alias chrome --tmpfs /dev/shm:rw,nosuid,nodev,noexec ${IMAGE_SELENIUM} >/dev/null
            ${CONTAINER_BIN} run --rm -d --name ac-install-web-${SUFFIX} --network ${NETWORK} --network-alias web --add-host "${CONTAINER_HOST}:host-gateway" ${USERSET} -v ${CORE_ROOT}:${CORE_ROOT} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} php -S web:8000 -t ${CORE_ROOT} >/dev/null
        else
            ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d ${SELENIUM_GRID} --name ac-install-chrome-${SUFFIX} --network ${NETWORK} --network-alias chrome --tmpfs /dev/shm:rw,nosuid,nodev,noexec ${IMAGE_SELENIUM} >/dev/null
            ${CONTAINER_BIN} run --rm ${CI_PARAMS} -d --name ac-install-web-${SUFFIX} --network ${NETWORK} --network-alias web -v ${CORE_ROOT}:${CORE_ROOT} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} php -S web:8000 -t ${CORE_ROOT} >/dev/null
        fi
        waitFor chrome 4444
        if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ]; then
            waitFor chrome 7900
        fi
        waitFor web 8000
        if [ "${ACCEPTANCE_HEADLESS}" -eq 0 ] && type "xdg-open" >/dev/null; then
            xdg-open http://localhost:7900/?autoconnect=1 >/dev/null
        elif [ "${ACCEPTANCE_HEADLESS}" -eq 0 ] && type "open" >/dev/null; then
            open http://localhost:7900/?autoconnect=1 >/dev/null
        fi
        case ${DBMS} in
            mariadb)
                CODECEPION_ENV="--env ci,mysql"
                if [ "${ACCEPTANCE_HEADLESS}" -eq 1 ]; then
                    CODECEPION_ENV="--env ci,mysql,headless"
                fi
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mariadb-ac-install-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MARIADB} >/dev/null
                DATABASE_IP=$(${CONTAINER_BIN} inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mariadb-ac-install-${SUFFIX})
                waitFor mariadb-ac-install-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3InstallMysqlDatabaseName=func_test -e typo3InstallMysqlDatabaseUsername=root -e typo3InstallMysqlDatabasePassword=funcp -e typo3InstallMysqlDatabaseHost=${DATABASE_IP}"
                COMMAND="bin/codecept run Install -d -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} --html reports.html"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-install-mariadb ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} ${COMMAND}
                SUITE_EXIT_CODE=$?
                ;;
            mysql)
                CODECEPION_ENV="--env ci,mysql"
                if [ "${ACCEPTANCE_HEADLESS}" -eq 1 ]; then
                    CODECEPION_ENV="--env ci,mysql,headless"
                fi
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mysql-ac-install-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MYSQL} >/dev/null
                DATABASE_IP=$(${CONTAINER_BIN} inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mysql-ac-install-${SUFFIX})
                waitFor mysql-ac-install-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3InstallMysqlDatabaseName=func_test -e typo3InstallMysqlDatabaseUsername=root -e typo3InstallMysqlDatabasePassword=funcp -e typo3InstallMysqlDatabaseHost=${DATABASE_IP}"
                COMMAND="bin/codecept run Install -d -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} --html reports.html"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-install-mysql ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} ${COMMAND}
                SUITE_EXIT_CODE=$?
                ;;
            postgres)
                CODECEPION_ENV="--env ci,postgresql"
                if [ "${ACCEPTANCE_HEADLESS}" -eq 1 ]; then
                    CODECEPION_ENV="--env ci,postgresql,headless"
                fi
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name postgres-ac-install-${SUFFIX} --network ${NETWORK} -d -e POSTGRES_PASSWORD=funcp -e POSTGRES_USER=funcu --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid ${IMAGE_POSTGRES} >/dev/null
                DATABASE_IP=$(${CONTAINER_BIN} inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres-ac-install-${SUFFIX})
                waitFor postgres-ac-install-${SUFFIX} 5432
                CONTAINERPARAMS="-e typo3InstallPostgresqlDatabasePort=5432 -e typo3InstallPostgresqlDatabaseName=${USER} -e typo3InstallPostgresqlDatabaseHost=${DATABASE_IP} -e typo3InstallPostgresqlDatabaseUsername=funcu -e typo3InstallPostgresqlDatabasePassword=funcp"
                COMMAND="bin/codecept run Install -d -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} --html reports.html"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-install-postgres ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} ${COMMAND}
                SUITE_EXIT_CODE=$?
                ;;
            sqlite)
                mkdir -p "${CORE_ROOT}/typo3temp/var/tests/functional-sqlite-dbs/"
                CODECEPION_ENV="--env ci,sqlite"
                if [ "${ACCEPTANCE_HEADLESS}" -eq 1 ]; then
                    CODECEPION_ENV="--env ci,sqlite,headless"
                fi
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_sqlite --tmpfs ${CORE_ROOT}/typo3temp/var/tests/functional-sqlite-dbs/:rw,noexec,nosuid"
                COMMAND="bin/codecept run Install -d -c typo3/sysext/core/Tests/codeception.yml ${CODECEPION_ENV} --html reports.html"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name ac-install-sqlite ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} ${COMMAND}
                SUITE_EXIT_CODE=$?
                ;;
        esac
        ;;
    buildCss)
        COMMAND="cd Build; yarn install || exit 1; node_modules/grunt/bin/grunt css ; cd .."
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name build-css-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    buildJavascript)
        COMMAND="cd Build; yarn install || exit 1; node_modules/grunt/bin/grunt scripts ; cd .."
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name build-js-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    cgl)
        # Active dry-run for cgl needs not "-n" but specific options
        if [ -n "${CGLCHECK_DRY_RUN}" ]; then
            CGLCHECK_DRY_RUN="--dry-run --diff"
        fi
        COMMAND="php -dxdebug.mode=off bin/php-cs-fixer fix -v ${CGLCHECK_DRY_RUN} --config=Build/php-cs-fixer/config.php"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name cgl-${SUFFIX} ${IMAGE_PHP} ${COMMAND}
        SUITE_EXIT_CODE=$?
        ;;
    cglGit)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name cgl-git-${SUFFIX} ${IMAGE_PHP} Build/Scripts/cglFixMyCommit.sh ${CGLCHECK_DRY_RUN}
        SUITE_EXIT_CODE=$?
        ;;
    cglHeader)
        # Active dry-run for cgl needs not "-n" but specific options
        if [ -n "${CGLCHECK_DRY_RUN}" ]; then
            CGLCHECK_DRY_RUN="--dry-run --diff"
        fi
        COMMAND="php -dxdebug.mode=off bin/php-cs-fixer fix -v ${CGLCHECK_DRY_RUN} --config=Build/php-cs-fixer/header-comment.php"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name cgl-header-${SUFFIX} ${IMAGE_PHP} ${COMMAND}
        SUITE_EXIT_CODE=$?
        ;;
    cglHeaderGit)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name cgl-header-git-${SUFFIX} ${IMAGE_PHP} Build/Scripts/cglFixMyCommitFileHeader.sh ${CGLCHECK_DRY_RUN}
        SUITE_EXIT_CODE=$?
        ;;
    checkAnnotations)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-annotations-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/annotationChecker.php
        SUITE_EXIT_CODE=$?
        ;;
    checkTestClassFinal)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-test-classes-final-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/testClassFinalChecker.php
        SUITE_EXIT_CODE=$?
        ;;
    checkTestMethodsPrefix)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-test-methods-prefix-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/testMethodPrefixChecker.php
        SUITE_EXIT_CODE=$?
        ;;
    checkBom)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-utf8bom-${SUFFIX} ${IMAGE_PHP} Build/Scripts/checkUtf8Bom.sh
        SUITE_EXIT_CODE=$?
        ;;
    checkComposer)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-composer-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/checkIntegrityComposer.php
        SUITE_EXIT_CODE=$?
        ;;
    checkExceptionCodes)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-exception-codes-${SUFFIX} ${IMAGE_PHP} Build/Scripts/duplicateExceptionCodeCheck.sh
        SUITE_EXIT_CODE=$?
        ;;
    checkExtensionScannerRst)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-extensionscanner-rst-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/extensionScannerRstFileReferences.php
        SUITE_EXIT_CODE=$?
        ;;
    checkFilePathLength)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-file-path-length-${SUFFIX} ${IMAGE_PHP} Build/Scripts/maxFilePathLength.sh
        SUITE_EXIT_CODE=$?
        ;;
    checkFilesAndPathsForSpaces)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-file-path-length-${SUFFIX} ${IMAGE_PHP} Build/Scripts/spacesInPathsAndFilenames.sh
        SUITE_EXIT_CODE=$?
        ;;
    checkGitSubmodule)
        COMMAND="if [ \$(git submodule status 2>&1 | wc -l) -ne 0 ]; then echo \"Found a submodule definition in repository\"; exit 1; fi"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-git-submodule-${SUFFIX} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    checkGruntClean)
        COMMAND="cd Build; yarn install || exit 1; node_modules/grunt/bin/grunt build; cd ..; git add *; git status; git status | grep -q \"nothing to commit, working tree clean\""
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-grunt-clean-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    checkNamespaceIntegrity)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-namespaces-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/checkNamespaceIntegrity.php
        SUITE_EXIT_CODE=$?
        ;;
    checkPermissions)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-permissions-${SUFFIX} ${IMAGE_PHP} Build/Scripts/checkFilePermissions.sh
        SUITE_EXIT_CODE=$?
        ;;
    checkRst)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name check-rst-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/validateRstFiles.php
        SUITE_EXIT_CODE=$?
        ;;
    clean)
        cleanBuildFiles
        cleanCacheFiles
        cleanRenderedDocumentationFiles
        cleanTestFiles
        ;;
    cleanBuild)
        cleanBuildFiles
        ;;
    cleanCache)
        cleanCacheFiles
        ;;
    cleanRenderedDocumentation)
        cleanRenderedDocumentationFiles
        ;;
    cleanTests)
        cleanTestFiles
        ;;
    composer)
        COMMAND=(composer "$@")
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name composer-${SUFFIX} -e COMPOSER_CACHE_DIR=.cache/composer -e COMPOSER_ROOT_VERSION=${COMPOSER_ROOT_VERSION} ${IMAGE_PHP} "${COMMAND[@]}"
        SUITE_EXIT_CODE=$?
        ;;
    composerInstall)
        COMMAND=(composer install --no-progress --no-interaction "$@")
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name composer-install-${SUFFIX} -e COMPOSER_CACHE_DIR=.cache/composer -e COMPOSER_ROOT_VERSION=${COMPOSER_ROOT_VERSION} ${IMAGE_PHP} "${COMMAND[@]}"
        SUITE_EXIT_CODE=$?
        ;;
    composerInstallMax)
        COMMAND="composer config --unset platform.php; composer update --no-progress --no-interaction ${COMPOSER_IGNORE_PLATFORM_REQ}; composer dumpautoload"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name composer-install-max-${SUFFIX} -e COMPOSER_CACHE_DIR=.cache/composer -e COMPOSER_ROOT_VERSION=${COMPOSER_ROOT_VERSION} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    composerInstallMin)
        COMMAND="composer config platform.php ${PHP_VERSION}.0; composer update --prefer-lowest --no-progress --no-interaction ${COMPOSER_IGNORE_PLATFORM_REQ} ; composer dumpautoload"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name composer-install-min-${SUFFIX} -e COMPOSER_CACHE_DIR=.cache/composer -e COMPOSER_ROOT_VERSION=${COMPOSER_ROOT_VERSION} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    composerTestDistribution)
        COMMAND="cd Build/composer; rm -rf composer.json composer.lock public/index.php public/typo3 public/typo3conf/ext var/ vendor/; cp composer.dist.json composer.json; composer update --no-progress --no-interaction"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name composer-test-distribution-${SUFFIX} -e COMPOSER_CACHE_DIR=${CORE_ROOT}/.cache/composer -e COMPOSER_ROOT_VERSION=${COMPOSER_ROOT_VERSION} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    composerValidate)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name composer-validate-${SUFFIX} ${IMAGE_PHP} composer validate
        SUITE_EXIT_CODE=$?
        ;;
    functional)
        if [ "${CHUNKS}" -gt 0 ]; then
            ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name func-splitter-${SUFFIX} ${IMAGE_PHP} php -dxdebug.mode=off Build/Scripts/splitFunctionalTests.php -v ${CHUNKS}
            COMMAND=(bin/phpunit -c Build/phpunit/FunctionalTests-Job-${THISCHUNK}.xml --exclude-group not-${DBMS} "$@")
        else
            COMMAND=(bin/phpunit -c Build/phpunit/FunctionalTests.xml --exclude-group not-${DBMS} "$@")
        fi
        ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name redis-func-${SUFFIX} --network ${NETWORK} -d ${IMAGE_REDIS} >/dev/null
        ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name memcached-func-${SUFFIX} --network ${NETWORK} -d ${IMAGE_MEMCACHED} >/dev/null
        waitFor redis-func-${SUFFIX} 6379
        waitFor memcached-func-${SUFFIX} 11211
        CONTAINER_COMMON_PARAMS="${CONTAINER_COMMON_PARAMS} -e typo3TestingRedisHost=redis-func-${SUFFIX} -e typo3TestingMemcachedHost=memcached-func-${SUFFIX}"
        case ${DBMS} in
            mariadb)
                echo "Using driver: ${DATABASE_DRIVER}"
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mariadb-func-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MARIADB} >/dev/null
                waitFor mariadb-func-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3DatabaseDriver=${DATABASE_DRIVER} -e typo3DatabaseName=func_test -e typo3DatabaseUsername=root -e typo3DatabaseHost=mariadb-func-${SUFFIX} -e typo3DatabasePassword=funcp"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            mysql)
                echo "Using driver: ${DATABASE_DRIVER}"
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mysql-func-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MYSQL} >/dev/null
                waitFor mysql-func-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3DatabaseDriver=${DATABASE_DRIVER} -e typo3DatabaseName=func_test -e typo3DatabaseUsername=root -e typo3DatabaseHost=mysql-func-${SUFFIX} -e typo3DatabasePassword=funcp"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            mssql)
                echo "Using driver: ${DATABASE_DRIVER}"
                ${CONTAINER_BIN} run --name mssql-func-${SUFFIX} --network ${NETWORK} -d -e ACCEPT_EULA="Y" -e SA_PASSWORD="Test1234!" -e MSSQL_PID=Developer ${IMAGE_MSSQL} >/dev/null
                waitFor mssql-func-${SUFFIX} 1433
                CONTAINERPARAMS="-e typo3DatabaseDriver=${DATABASE_DRIVER} -e typo3DatabasePort=1433 -e typo3DatabaseName=func_test -e typo3DatabaseUsername=SA -e typo3DatabaseHost=mssql-func-${SUFFIX} -e typo3DatabasePassword=Test1234! -e typo3DatabaseCharset=utf-8"
                ${CONTAINER_BIN} run ${DOCKER_COMMON_PARAMS} --name functional-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} ${COMMAND}
                SUITE_EXIT_CODE=$?
                ;;
            postgres)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name postgres-func-${SUFFIX} --network ${NETWORK} -d -e POSTGRES_PASSWORD=funcp -e POSTGRES_USER=funcu --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid ${IMAGE_POSTGRES} >/dev/null
                waitFor postgres-func-${SUFFIX} 5432
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_pgsql -e typo3DatabaseName=bamboo -e typo3DatabaseUsername=funcu -e typo3DatabaseHost=postgres-func-${SUFFIX} -e typo3DatabasePassword=funcp"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            sqlite)
                # create sqlite tmpfs mount typo3temp/var/tests/functional-sqlite-dbs/ to avoid permission issues
                mkdir -p "${CORE_ROOT}/typo3temp/var/tests/functional-sqlite-dbs/"
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_sqlite --tmpfs ${CORE_ROOT}/typo3temp/var/tests/functional-sqlite-dbs/:rw,noexec,nosuid"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
        esac
        ;;
    functionalDeprecated)
        COMMAND=(bin/phpunit -c Build/phpunit/FunctionalTestsDeprecated.xml --exclude-group not-${DBMS} "$@")
        ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name redis-func-dep-${SUFFIX} --network ${NETWORK} -d ${IMAGE_REDIS} >/dev/null
        ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name memcached-func-dep-${SUFFIX} --network ${NETWORK} -d ${IMAGE_MEMCACHED} >/dev/null
        waitFor redis-func-dep-${SUFFIX} 6379
        waitFor memcached-func-dep-${SUFFIX} 11211
        CONTAINER_COMMON_PARAMS="${CONTAINER_COMMON_PARAMS} -e typo3TestingRedisHost=redis-func-dep-${SUFFIX} -e typo3TestingMemcachedHost=memcached-func-dep-${SUFFIX}"
        case ${DBMS} in
            mariadb)
                echo "Using driver: ${DATABASE_DRIVER}"
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mariadb-func-dep-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MARIADB} >/dev/null
                waitFor mariadb-func-dep-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3DatabaseDriver=${DATABASE_DRIVER} -e typo3DatabaseName=func_test -e typo3DatabaseUsername=root -e typo3DatabaseHost=mariadb-func-dep-${SUFFIX} -e typo3DatabasePassword=funcp"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-deprecated-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            mysql)
                echo "Using driver: ${DATABASE_DRIVER}"
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name mysql-func-dep-${SUFFIX} --network ${NETWORK} -d -e MYSQL_ROOT_PASSWORD=funcp --tmpfs /var/lib/mysql/:rw,noexec,nosuid ${IMAGE_MYSQL} >/dev/null
                waitFor mysql-func-dep-${SUFFIX} 3306
                CONTAINERPARAMS="-e typo3DatabaseDriver=${DATABASE_DRIVER} -e typo3DatabaseName=func_test -e typo3DatabaseUsername=root -e typo3DatabaseHost=mysql-func-dep-${SUFFIX} -e typo3DatabasePassword=funcp"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-deprecated-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            mssql)
                echo "Using driver: ${DATABASE_DRIVER}"
                ${CONTAINER_BIN} run --rm --name mssql-func-dep-${SUFFIX} --network ${NETWORK} -d -e ACCEPT_EULA="Y" -e SA_PASSWORD="Test1234!" -e MSSQL_PID=Developer ${IMAGE_MSSQL} >/dev/null
                waitFor mssql-func-dep-${SUFFIX} 1433
                CONTAINERPARAMS="-e typo3DatabaseDriver=${DATABASE_DRIVER} -e typo3DatabasePort=1433 -e typo3DatabaseName=func_test -e typo3DatabaseUsername=SA -e typo3DatabaseHost=mssql-func-dep-${SUFFIX} -e typo3DatabasePassword=Test1234! -e typo3DatabaseCharset=utf-8"
                ${CONTAINER_BIN} run ${DOCKER_COMMON_PARAMS} --name functional-deprecated-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} ${COMMAND}
                SUITE_EXIT_CODE=$?
                ;;
            postgres)
                ${CONTAINER_BIN} run --rm ${CI_PARAMS} --name postgres-func-dep-${SUFFIX} --network ${NETWORK} -d -e POSTGRES_PASSWORD=funcp -e POSTGRES_USER=funcu --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid ${IMAGE_POSTGRES} >/dev/null
                waitFor postgres-func-dep-${SUFFIX} 5432
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_pgsql -e typo3DatabaseName=bamboo -e typo3DatabaseUsername=funcu -e typo3DatabaseHost=postgres-func-dep-${SUFFIX} -e typo3DatabasePassword=funcp"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-deprecated-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
            sqlite)
                # create sqlite tmpfs mount typo3temp/var/tests/functional-sqlite-dbs/ to avoid permission issues
                mkdir -p "${CORE_ROOT}/typo3temp/var/tests/functional-sqlite-dbs/"
                CONTAINERPARAMS="-e typo3DatabaseDriver=pdo_sqlite --tmpfs ${CORE_ROOT}/typo3temp/var/tests/functional-sqlite-dbs/:rw,noexec,nosuid"
                ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name functional-deprecated-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${CONTAINERPARAMS} ${IMAGE_PHP} "${COMMAND[@]}"
                SUITE_EXIT_CODE=$?
                ;;
        esac
        ;;
    listExceptionCodes)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name list-exception-codes-${SUFFIX} ${IMAGE_PHP} Build/Scripts/duplicateExceptionCodeCheck.sh -p
        SUITE_EXIT_CODE=$?
        ;;
    lintHtml)
        COMMAND="cd Build; yarn install || exit 1; node_modules/grunt/bin/grunt lintspaces"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name lint-html-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    lintPhp)
        COMMAND="php -v | grep '^PHP'; find typo3/ -name \\*.php -print0 | xargs -0 -n1 -P"'$(nproc 2>/dev/null || echo 4)'" php -dxdebug.mode=off -l >/dev/null"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name lint-php-${SUFFIX} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    lintScss)
        COMMAND="cd Build; yarn install || exit 1; node_modules/grunt/bin/grunt stylelint"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name lint-css-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    lintServicesYaml)
        COMMAND="php -v | grep '^PHP'; find typo3/ -name 'Services.yaml' | xargs -r php -dxdebug.mode=off bin/yaml-lint --parse-tags"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name lint-php-${SUFFIX} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    lintTypescript)
        COMMAND="cd Build; yarn install || exit 1; node_modules/grunt/bin/grunt eslint"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name lint-typescript-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    lintYaml)
        EXCLUDE_INVALID_FIXTURE_YAML_FILES="--exclude typo3/sysext/form/Tests/Unit/Mvc/Configuration/Fixtures/Invalid.yaml"
        COMMAND="php -v | grep '^PHP'; find typo3/ \\( -name '*.yaml' -o -name '*.yml' \\) ! -name 'Services.yaml' | xargs -r php -dxdebug.mode=off bin/yaml-lint --no-parse-tags ${EXCLUDE_INVALID_FIXTURE_YAML_FILES}"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name lint-php-${SUFFIX} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    npm)
        COMMAND=(npm "$@")
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} -w ${CORE_ROOT}/Build -e HOME=${CORE_ROOT}/.cache --name npm-${SUFFIX} ${IMAGE_NODEJS} "${COMMAND[@]}"
        SUITE_EXIT_CODE=$?
        ;;
    phpstan)
        COMMAND=(php -dxdebug.mode=off bin/phpstan analyse -c Build/phpstan/${PHPSTAN_CONFIG_FILE} --verbose --no-progress --no-interaction --memory-limit 4G "$@")
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name phpstan-${SUFFIX} ${IMAGE_PHP} "${COMMAND[@]}"
        SUITE_EXIT_CODE=$?
        ;;
    phpstanGenerateBaseline)
        COMMAND="php -dxdebug.mode=off bin/phpstan analyse -c Build/phpstan/${PHPSTAN_CONFIG_FILE} --verbose --no-progress --no-interaction --memory-limit 4G --generate-baseline=Build/phpstan/phpstan-baseline.neon"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name phpstan-baseline-${SUFFIX} ${IMAGE_PHP} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    unit)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name unit-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} bin/phpunit -c Build/phpunit/UnitTests.xml "$@"
        SUITE_EXIT_CODE=$?
        ;;
    unitDeprecated)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name unit-deprecated-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} bin/phpunit -c Build/phpunit/UnitTestsDeprecated.xml "$@"
        SUITE_EXIT_CODE=$?
        ;;
    unitJavascript)
        COMMAND="cd Build; yarn install || exit 1; cd ..; Build/node_modules/karma/bin/karma start vendor/typo3/testing-framework/Resources/Core/Build/Configuration/JSUnit/karma.conf.ci.js --single-run"
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name unit-javascript-${SUFFIX} -e HOME=${CORE_ROOT}/.cache ${IMAGE_NODEJS_CHROME} /bin/sh -c "${COMMAND}"
        SUITE_EXIT_CODE=$?
        ;;
    unitRandom)
        ${CONTAINER_BIN} run ${CONTAINER_COMMON_PARAMS} --name unit-random-${SUFFIX} ${XDEBUG_MODE} -e XDEBUG_CONFIG="${XDEBUG_CONFIG}" ${IMAGE_PHP} bin/phpunit -c Build/phpunit/UnitTests.xml --order-by=random "$@"
        SUITE_EXIT_CODE=$?
        ;;
    update)
        # pull typo3/core-testing-* versions of those ones that exist locally
        echo "> pull ghcr.io/typo3/core-testing-* versions of those ones that exist locally"
        ${CONTAINER_BIN} images "ghcr.io/typo3/core-testing-*" --format "{{.Repository}}:{{.Tag}}" | xargs -I {} ${CONTAINER_BIN} pull {}
        echo ""
        # remove "dangling" typo3/core-testing-* images (those tagged as <none>)
        echo "> remove \"dangling\" ghcr.io/typo3/core-testing-* images (those tagged as <none>)"
        ${CONTAINER_BIN} images --filter "reference=ghcr.io/typo3/core-testing-*" --filter "dangling=true" --format "{{.ID}}" | xargs -I {} ${CONTAINER_BIN} rmi -f {}
        echo ""
        ;;
    *)
        loadHelp
        echo "Invalid -s option argument ${TEST_SUITE}" >&2
        echo >&2
        echo "${HELP}" >&2
        exit 1
        ;;
esac

cleanUp

# Print summary
echo "" >&2
echo "###########################################################################" >&2
echo "Result of ${TEST_SUITE}" >&2
echo "Container runtime: ${CONTAINER_BIN}" >&2
echo "Container suffix: ${SUFFIX}"
echo "PHP: ${PHP_VERSION}" >&2
if [[ ${TEST_SUITE} =~ ^(functional|functionalDeprecated|acceptance|acceptanceComposer|acceptanceInstall)$ ]]; then
    case "${DBMS}" in
        mariadb|mysql|postgres)
            echo "DBMS: ${DBMS}  version ${DBMS_VERSION}  driver ${DATABASE_DRIVER}" >&2
            ;;
        mssql)
            echo "DBMS: ${DBMS}  driver ${DATABASE_DRIVER}" >&2
            ;;
        sqlite)
            echo "DBMS: ${DBMS}" >&2
            ;;
    esac
fi
if [[ ${SUITE_EXIT_CODE} -eq 0 ]]; then
    echo "SUCCESS" >&2
else
    echo "FAILURE" >&2
fi
echo "###########################################################################" >&2
echo "" >&2

# Exit with code of test suite - This script return non-zero if the executed test failed.
exit $SUITE_EXIT_CODE
