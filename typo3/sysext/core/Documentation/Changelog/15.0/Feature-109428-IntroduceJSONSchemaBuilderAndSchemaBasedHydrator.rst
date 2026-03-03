..  include:: /Includes.rst.txt

..  _feature-109428-1791879327:

=========================================================================
Feature: #109428 - Introduce JSON SchemaBuilder and schema based Hydrator
=========================================================================

See :issue:`109428`

Description
===========

Components that interact with external systems – for example an API
endpoint, an AI tool call or an MCP server – need to describe the data
they accept or return, and need to turn incoming raw data back into
typed PHP values.

A new :php:`\TYPO3\CMS\Core\JsonSchema\SchemaBuilder` creates a
`JSON Schema <https://json-schema.org/>`__ from a PHP type, described by
`symfony/type-info`. The result is an immutable
:php:`\TYPO3\CMS\Core\JsonSchema\Schema` object, which can be encoded
with :php:`json_encode()`. Scalars, lists, maps, array shapes, unions,
intersections, enums, :php:`\DateTimeInterface` implementations, data
objects (with their promoted constructor properties) and generic data
objects using :php:`@template` annotations are supported. Object
definitions are collected in a
:php:`\TYPO3\CMS\Core\JsonSchema\SchemaStore` and referenced via
:json:`$ref`, which allows circular structures.

A new :php:`\TYPO3\CMS\Core\JsonSchema\Hydrator` uses such a schema to
turn raw data – as returned by :php:`json_decode()` – into the described
PHP values, including enums, :php:`\DateTimeImmutable` instances and
data objects. Optionally, string values (for example query parameters)
can be coerced to the scalar types the schema expects.

..  code-block:: php

    use Symfony\Component\TypeInfo\Type;
    use TYPO3\CMS\Core\JsonSchema\Hydrator;
    use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;

    final readonly class Coordinates
    {
        public function __construct(
            public float $latitude,
            public float $longitude,
            public ?string $label = null,
        ) {}
    }

    $schema = (new SchemaBuilder())->build(Type::object(Coordinates::class));

    // Expose the schema to an external system
    $json = json_encode($schema);

    // Hydrate raw input data based on the schema
    $coordinates = (new Hydrator())->hydrate(
        json_decode('{"latitude": 50.9, "longitude": 6.9}'),
        $schema,
    );

The PHP attributes
:php:`\TYPO3\CMS\Core\Attribute\Serialization\IntersectWithParent` and
:php:`\TYPO3\CMS\Core\Attribute\Serialization\DynamicSerializationSchema`
control how nested data objects are represented in a schema, and
:php:`\TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderInterface` allows
to provide schemas that are only known at runtime.

Impact
======

TYPO3 Core provides a building block to describe data objects as JSON
Schema and to hydrate them from raw data, which upcoming APIs make use
of. Extensions can use the same API to expose and consume their own data
objects.

..  index:: PHP-API, NotScanned, ext:core
