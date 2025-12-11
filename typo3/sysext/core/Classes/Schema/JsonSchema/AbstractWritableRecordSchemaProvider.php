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

namespace TYPO3\CMS\Core\Schema\JsonSchema;

use TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderInterface;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

/**
 * Provides the schemas for writing records, one per table,
 * discriminated by the `_schema` property.
 *
 * @internal
 */
abstract readonly class AbstractWritableRecordSchemaProvider implements DynamicSchemaProviderInterface
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private SchemaBuilder $schemaBuilder,
    ) {}

    abstract protected function getType(): RecordSchemaType;

    public function getSchema(SchemaStore $store): Schema
    {
        $type = $this->getType();
        $oneOf = [];
        $mapping = [];
        foreach ($this->tcaSchemaFactory->all() as $tcaSchema) {
            $name = $type->getSchemaName($tcaSchema->getName());
            $store->set($name, $this->schemaBuilder->buildUnifiedSchemaWithTypes($tcaSchema, $type));
            $oneOf[] = new Schema(
                description: $tcaSchema->getName(),
                ref: '#/$defs/' . $name
            );
            $mapping[$tcaSchema->getName()] = '#/$defs/' . $name;
        }

        return new Schema(
            description: '`' . $type->getDtoClass() . '`',
            oneOf: $oneOf,
            discriminator: [
                'propertyName' => '_schema',
                'mapping' => $mapping,
            ],
        );
    }

    /**
     * @return list<string>
     */
    public function getProvidedSchemas(): array
    {
        $type = $this->getType();
        $schemas = [
            'TYPO3.CMS.Core.Domain.Dto.' . $type->value,
        ];
        foreach ($this->tcaSchemaFactory->all() as $tcaSchema) {
            $schemas[] = $type->getSchemaName($tcaSchema->getName());
        }
        return $schemas;
    }
}
