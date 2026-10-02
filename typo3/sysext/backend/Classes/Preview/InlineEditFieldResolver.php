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

namespace TYPO3\CMS\Backend\Preview;

use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Resolves the fields of a record that are offered for inline editing
 * in the page module, based on "mod.web_layout.inlineEditing" page TSconfig.
 *
 * @internal
 */
readonly class InlineEditFieldResolver
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
    ) {}

    /**
     * @param array $configuration The "mod.web_layout.inlineEditing" page TSconfig, dots removed
     * @return list<string>
     */
    public function resolve(string $table, string $recordType, array $configuration, BackendUserAuthentication $backendUser): array
    {
        if (!(bool)($configuration['enabled'] ?? false) || !$this->tcaSchemaFactory->has($table)) {
            return [];
        }
        $schema = $this->tcaSchemaFactory->get($table);
        $typeFieldName = null;
        if ($schema->supportsSubSchema()) {
            $typeFieldName = $schema->getSubSchemaTypeInformation()->getFieldName();
            if ($schema->hasSubSchema($recordType)) {
                $schema = $schema->getSubSchema($recordType);
            }
        }

        $fieldsConfiguration = is_array($configuration['fields'] ?? null) ? $configuration['fields'] : [];
        $fieldList = $fieldsConfiguration[$recordType] ?? $fieldsConfiguration['default'] ?? '';
        $fields = [];
        foreach (GeneralUtility::trimExplode(',', (string)$fieldList, true) as $fieldName) {
            if ($fieldName === $typeFieldName || in_array($fieldName, $fields, true) || !$schema->hasField($fieldName)) {
                continue;
            }
            if ($schema->getField($fieldName)->supportsAccessControl()
                && !$backendUser->check('non_exclude_fields', $table . ':' . $fieldName)
            ) {
                continue;
            }
            $fields[] = $fieldName;
        }
        return $fields;
    }
}
