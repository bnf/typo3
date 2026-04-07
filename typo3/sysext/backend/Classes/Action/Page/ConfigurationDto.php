<?php

declare(strict_types=1);

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

namespace TYPO3\CMS\Backend\Action\Page;

final readonly class ConfigurationDto
{
    public function __construct(
        public bool $allowDragMove,
        /** @var list<array{nodeType: int, icon: string, title: string}> */
        public array $doktypes,
        public bool $displayDeleteConfirmation,
        public string $temporaryMountPoint,
        public true $showIcons,
        public string $dataUrl,
        public string $rootlineUrl,
        public string $filterUrl,
        public string $setTemporaryMountPointUrl,
        public bool $searchInTranslatedPagesEnabled,
        public bool $searchInTranslatedPagesAvailable,
        public bool $searchByFrontendUriEnabled,
        public bool $searchByFrontendUriAvailable,
    ) {}
}
