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
use TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderInterface;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Domain\Dto\Record;

//#[AsTaggedItem(index: Record::class)]
#[AsTaggedItem(index: 'TYPO3.CMS.Core.Domain.Dto.Record')]
final readonly class DynamicSchemaProvider implements DynamicSchemaProviderInterface
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private SchemaBuilder $schemaBuilder,
    ) {}

    public function getSchema(SchemaStore $store): Schema
    {
        $recordSchemaAnyOf = [];
        foreach ($this->tcaSchemaFactory->all() as $tcaSchema) {
            $name = 'TYPO3.CMS.Core.Domain.Dto.Record_' . $tcaSchema->getName() . '_';
            $schema = $this->schemaBuilder->buildUnifiedSchemaWithTypes($tcaSchema);
            $store->set($name, $schema);
            $recordSchemaAnyOf[] = new Schema(
                description: $tcaSchema->getName(),
                ref: '#/$defs/' . $name
            );
        }

        return new Schema(
            description: '`' . Record::class . '`',
            oneOf: $recordSchemaAnyOf,
            //allOf: $recordSchemaAnyOf,
        );
    }

    /**
     * @return list<string>
     */
    public function getProvidedSchemas(): array
    {
        $schemas = [
            'TYPO3.CMS.Core.Domain.Dto.Record',
        ];
        foreach ($this->tcaSchemaFactory->all() as $tcaSchema) {
            $name = 'TYPO3.CMS.Core.Domain.Dto.Record_' . $tcaSchema->getName() . '_';
            $schemas[] = $name;
        }
        return $schemas;
    }
}
