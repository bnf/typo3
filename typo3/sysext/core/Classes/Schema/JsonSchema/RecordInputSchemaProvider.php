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

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderInterface;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

/**
 * Provides the schemas for writing records (`RecordInput`), one per table,
 * discriminated by the `_schema` property.
 *
 * @internal
 */
#[AsTaggedItem(index: 'TYPO3.CMS.Core.Domain.Dto.RecordInput')]
final readonly class RecordInputSchemaProvider implements DynamicSchemaProviderInterface
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private SchemaBuilder $schemaBuilder,
    ) {}

    public function getSchema(SchemaStore $store): Schema
    {
        $oneOf = [];
        $mapping = [];
        foreach ($this->tcaSchemaFactory->all() as $tcaSchema) {
            $name = $this->schemaBuilder->getSchemaName($tcaSchema->getName(), true);
            $store->set($name, $this->schemaBuilder->buildUnifiedSchemaWithTypes($tcaSchema, true));
            $oneOf[] = new Schema(
                description: $tcaSchema->getName(),
                ref: '#/$defs/' . $name
            );
            $mapping[$tcaSchema->getName()] = '#/$defs/' . $name;
        }

        return new Schema(
            description: '`' . RecordInput::class . '`',
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
        $schemas = [
            'TYPO3.CMS.Core.Domain.Dto.RecordInput',
        ];
        foreach ($this->tcaSchemaFactory->all() as $tcaSchema) {
            $schemas[] = $this->schemaBuilder->getSchemaName($tcaSchema->getName(), true);
        }
        return $schemas;
    }
}
