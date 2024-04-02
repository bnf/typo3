<?php

declare(strict_types=1);
require 'vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;

$fileName = 'typo3/sysext/core/Configuration/DefaultConfigurationDescription.yaml';
$data = Yaml::parseFile($fileName);
$defaultConfiguration = require('typo3/sysext/core/Configuration/DefaultConfiguration.php');

$schema = (new SchemaConverter())->parseSchema(
    [
        'type' => 'container',
        'description' => 'TYPO3 Core Settings',
        'items' => $data,
    ],
    $defaultConfiguration
);

echo json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_LINE_TERMINATORS | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

class SchemaConverter
{
    private function parseContainer(object $schema, array $data, array $default): object
    {
        $schema->type = 'object';
        $schema->properties = new stdClass();
        foreach ($data['items'] as $propertyName => $propertyData) {
            $schema->properties->{$propertyName} = $this->parseSchema($propertyData, $default[$propertyName] ?? null);
        }
        return $schema;
    }

    private function parseText(object $schema, array $data, string|int $default = null): object
    {
        $schema->type = 'string';
        if ($default !== null && is_int($default)) {
            $schema->type = 'integer';
        } elseif ($default !== null && !is_string($default)) {
            fprintf(STDERR, "%s\n", var_export($schema, true));
            exit;
        }
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseMultiline(object $schema, array $data, string $default = null): object
    {
        $schema->type = 'string';
        if ($default !== null) {
            $schema->default = $default;
        }
        // @todo there is no way to define a multiline Textfield in json-schema
        return $schema;
    }

    private function parseBool(object $schema, array $data, bool|int $default = null): object
    {
        $schema->type = 'boolean';
        if ($default === 0) {
            $default = false;
        }
        if ($default === 1) {
            $default = true;
        }
        if ($default !== null && !is_bool($default)) {
            fprintf(STDERR, "%s\n", var_export($schema, true));
            exit;
        }
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseInt(object $schema, array $data, int $default = null): object
    {
        $schema->type = 'integer';
        if (isset($data['allowedValues'])) {
            $schema->enum = array_keys($data['allowedValues']);
            $schema->enumNames = array_values($data['allowedValues']);
        }
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseDropdown(object $schema, array $data, string $default = null): object
    {
        $schema->type = 'string';
        $schema->enum = array_keys($data['allowedValues']);
        $schema->enumNames = array_values($data['allowedValues']);
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseArray(object $schema, array $data, array|string $default = null): object
    {
        $schema->type = 'array';
        if (is_string($default)) {
            $default = explode(',', $default);
        }
        // @todo verify
        $schema->items = new stdClass();
        $schema->items->type = 'string';
        if ($default !== null && $default !== array_values($default)) {
            $schema->type = 'object';
            $schema->additionalProperties = new stdClass();
            // @todo verify
            $schema->additionalProperties->type = 'string';
            if ($default !== null) {
                $schema->default = new stdClass();
                foreach ($default as $propertyName => $value) {
                    $schema->default->{$propertyName} = $value;
                }
            }
            fprintf(STDERR, "warning: %s is not a real array\n", $schema->description);
        } elseif ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseMixed(object $schema, array $data, string|bool $default = null): object
    {
        // @todo is there any difference between mixed and string?
        $schema->type = 'string';
        if (is_bool($default)) {
            $schema->type = 'boolean';
        }
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseList(object $schema, array $data, string $default = null): object
    {
        // @todo encode password constaintsis there any difference between list and string?
        $schema->type = 'string';
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parsePassword(object $schema, array $data, string $default = null): object
    {
        // @todo encode passwords for UI
        $schema->type = 'string';
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parsePhpClass(object $schema, array $data, string $default = null): object
    {
        // @todo is there any difference between phpClass and string?
        $schema->type = 'string';
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    private function parseErrors(object $schema, array $data, int $default = null): object
    {
        // @todo is there any difference between errors and number
        $schema->type = 'number';
        if ($default !== null) {
            $schema->default = $default;
        }
        return $schema;
    }

    public function parseSchema(array $data, mixed $default = null): object
    {
        $type = $data['type'] ?? '';
        $schema = new stdClass();
        if (isset($data['description'])) {
            $schema->description = $data['description'];
        }
        return match ($data['type']) {
            'container' => $this->parseContainer($schema, $data, $default),
            'text' => $this->parseText($schema, $data, $default),
            'multiline' => $this->parseMultiline($schema, $data, $default),
            'bool' => $this->parseBool($schema, $data, $default),
            'int' => $this->parseInt($schema, $data, $default),
            'array' => $this->parseArray($schema, $data, $default),
            'dropdown' => $this->parseDropdown($schema, $data, $default),
            'mixed' => $this->parseMixed($schema, $data, $default),
            'list' => $this->parseList($schema, $data, $default),
            'password' => $this->parsePassword($schema, $data, $default),
            'phpClass' => $this->parsePhpClass($schema, $data, $default),
            'errors' => $this->parseErrors($schema, $data, $default),
            //default => $schema,
            default => throw new \LogicException('Unhandled type ' . $type),
        };
    }
}
