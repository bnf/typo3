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

namespace TYPO3\CMS\Core\JsonSchema;

use TYPO3\CMS\Core\Utility\MathUtility;

/**
 * @internal
 */
final readonly class Hydrator
{
    public function coerceScalars(string $value, Schema $schema): string|int|float|bool|null
    {
        $schema = new ResolvingSchema($schema);
        return match (true) {
            $this->allowsType($schema, 'integer') && MathUtility::canBeInterpretedAsInteger($value) => (int)$value,
            $this->allowsType($schema, 'number') && MathUtility::canBeInterpretedAsInteger($value) => (int)$value,
            $this->allowsType($schema, 'number') && MathUtility::canBeInterpretedAsFloat($value) => (float)$value,
            $this->allowsType($schema, 'boolean') => match ($value) {
                'false', '0', 'no' => false,
                'true', '1', 'yes' => true,
                default => $value,
            },
            $this->allowsType($schema, 'null') && $value === 'null' => null,
            default => $value,
        };
    }

    private function allowsType(ResolvingSchema $schema, string $type)
    {
        return $schema->type === $type || (is_array($schema->type) && in_array($type, $schema->type, true));
    }

    public function hydrate(int|float|string|bool|array|\stdClass $data, Schema|ResolvingSchema $schema, bool $coerce = false): mixed
    {
        if ($schema instanceof Schema) {
            $schema = new ResolvingSchema($schema);
        }
        if ($schema->type === null) {
            if ($schema->anyOf !== null) {
                $lastException = null;
                foreach ($schema->anyOf as $subschema) {
                    try {
                        return $this->hydrate($data, $subschema);
                    } catch (\RuntimeException $e) {
                        $lastException = $e;
                    }
                }
                throw $lastException;
            }
            // mixed
            return $data;
        }

        $matchType = fn(string $type): mixed => match ($type) {
            'string' => $this->mapString($data, $schema, $coerce),
            'integer' => $this->mapEnum($this->mapInteger($data, $schema, $coerce), $schema),
            'number' => $this->mapNumber($data, $schema, $coerce),
            'boolean' => $this->mapBoolean($data, $schema, $coerce),
            'array' => $this->mapArray($data, $schema, $coerce),
            'object' => $this->mapObject($data, $schema, $coerce),
            'null' => $this->mapNull($data, $schema, $coerce),
            default => throw new \RuntimeException('Unsupported type: ' . json_encode($type) . ' – ' . json_encode($schema) . ':' . json_encode($data), 1766826318),
        };

        if (is_array($schema->type)) {
            $lastException = null;
            foreach ($schema->type as $type) {
                try {
                    return $matchType($type);
                } catch (\RuntimeException $e) {
                    $lastException = $e;
                }
            }
            throw $lastException;
        }
        return $matchType($schema->type);
    }

    private function mapEnum(int|string $data, ResolvingSchema $schema): \BackedEnum|\UnitEnum|int|string
    {
        if ($schema->enum !== null && $schema->xTypo3Type !== null) {
            $enumName = $schema->xTypo3Type;
            if (is_subclass_of($schema->xTypo3Type, \BackedEnum::class)) {
                return $enumName::from($data);
            }
            $data = (string)$data;
            return constant("$enumName::$data");
        }
        return $data;
    }

    private function mapString(mixed $data, ResolvingSchema $schema, bool $coerce): string|object
    {
        if ($schema->xTypo3Type && class_exists($schema->xTypo3Type) && !is_subclass_of($schema->xTypo3Type, \UnitEnum::class)) {
            return new ($schema->xTypo3Type)($data);
        }
        if (is_string($data)) {
            return $this->mapEnum($data, $schema);
        }
        if ($coerce && is_scalar($data)) {
            return $this->mapEnum((string)$data, $schema);
        }
        throw new \RuntimeException('Invalid data: ' . gettype($data), 1766826319);
    }

    private function mapInteger(mixed $data, ResolvingSchema $schema, bool $coerce): int
    {
        if (is_int($data)) {
            return $data;
        }
        if (MathUtility::canBeInterpretedAsInteger($data)) {
            return (int)$data;
        }
        throw new \RuntimeException('Invalid data', 1766826321);
    }

    private function mapNumber(mixed $data, ResolvingSchema $schema, bool $coerce): int|float
    {
        if (is_int($data) || is_float($data)) {
            return $data;
        }
        if ($coerce && MathUtility::canBeInterpretedAsInteger($data)) {
            return (int)$data;
        }
        if ($coerce && MathUtility::canBeInterpretedAsFloat($data)) {
            return (float)$data;
        }
        throw new \RuntimeException('Invalid data', 1766826320);
    }

    private function mapBoolean(mixed $data, ResolvingSchema $schema, bool $coerce): bool
    {
        if (is_bool($data)) {
            return $data;
        }

        if ($coerce) {
            $data = match ($data) {
                'false', '0', 'no' => false,
                'true', '1', 'yes' => true,
                default => null,
            };
        }
        throw new \RuntimeException('Invalid data', 1766826322);
    }

    private function mapArray(mixed $data, ResolvingSchema $schema, bool $coerce): array
    {
        if (!is_array($data)) {
            throw new \RuntimeException('Invalid data', 1766826323);
        }

        foreach ($data as $key => $value) {
            $data[$key] = $this->hydrate($value, $schema->items);
        }

        return $data;
    }

    private function mapObject(mixed $data, ResolvingSchema $schema, bool $coerce): object|array
    {
        if (!($data instanceof \stdClass)) {
            throw new \RuntimeException('Invalid data', 1766826324);
        }

        $values = get_object_vars($data);
        foreach ($values as $key => $value) {
            $values[$key] = array_key_exists($key, $schema->properties ?? [])
                ? $this->hydrate($value, $schema->properties[$key]) : (
                    $schema->additionalProperties !== null
                    ? $this->hydrate($value, $schema->additionalProperties)
                    : $value
                );
        }

        $typo3Type = $schema->xTypo3Type;
        return match ($typo3Type) {
            'array' => $values,
            null => (object)$values,
            default => new $typo3Type(...$values),
        };
    }

    private function mapNull(mixed $data, ResolvingSchema $schema, bool $coerce): null
    {
        if ($data === null) {
            return null;
        }

        if ($coerce && $data === 'null') {
            return null;
        }

        throw new \RuntimeException('Invalid data', 1766826325);
    }
}
