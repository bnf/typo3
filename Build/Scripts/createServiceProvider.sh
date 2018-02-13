#!/bin/bash

ext=$1
ext_upper_camel_case=`echo ${ext} | sed -e 's/_\(.\)/\u\1/' -e 's/^./\u&/'`

if [ ! -d typo3/sysext/${ext}/ ]; then
	echo "typo3/sysext/${ext}/ does not exist"
	exit 1
fi

[[ ! -d typo3/sysext/${ext}/Classes/ ]] && exit 0

function findSingletons() {
    git grep "class .* implements .*SingletonInterface" typo3/sysext/${ext}/Classes | \
        sed -e '/ServiceProvider/d' -e '/:abstract/d' -e 's/.*Classes\///' -e 's/\.php//' -e 's/class //' -e 's/ extends.*//' -e 's/ implements.*//' -e 's:/:\\:g'
}

[[ `findSingletons ${ext} | wc -l` -eq 0 ]] && exit 0

function generate() {
cat << EOF
<?php
declare(strict_types = 1);
namespace TYPO3\\CMS\\${ext_upper_camel_case};

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use Psr\\Container\\ContainerInterface;
use TYPO3\\CMS\\Core\\Core\\AbstractServiceProvider;
use TYPO3\\CMS\\Core\\Utility\\GeneralUtility;

class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
EOF

git grep "class .* implements .*SingletonInterface" typo3/sysext/${ext}/Classes | \
    sed -e '/ServiceProvider/d' -e '/:abstract/d' -e 's/.*Classes\///' -e 's/\.php//' -e 's/class //' -e 's/ extends.*//' -e 's/ implements.*//' -e 's:/:\\:g' \
	-e "s/^\\([^:]*\\):\\([^:]*\\)$/\\1::class => [ static::class, 'get\\2\\' ],/" -e 's/^/            /'

cat << EOF
        ];
    }
EOF

git grep "class .* implements .*SingletonInterface" typo3/sysext/${ext}/Classes | \
    sed -e '/ServiceProvider/d' -e '/:abstract/d' -e 's/.*Classes\///' -e 's/\.php//' -e 's/class //' -e 's/ extends.*//' -e 's/ implements.*//' -e 's:/:\\:g' \
	-e "s/^\([^:]*\):\([^:]*\)$/\npublic static function get\2(ContainerInterface \$container): \1\n{\n    return GeneralUtility::makeInstance(\1::class);\n}/" | \
    sed -e '/./s/^/    /'

cat << EOF
}
EOF
}

generate $ext > typo3/sysext/${ext}/Classes/ServiceProvider.php
