<?php

declare(strict_types=1);
require 'vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;

$fileName = 'typo3/sysext/core/Configuration/DefaultConfigurationDescription.yaml';
$data = Yaml::parseFile($fileName);
$defaultConfiguration = require('typo3/sysext/core/Configuration/DefaultConfiguration.php');

$schema = new stdClass();
$schema->version = 1;
$schema->system = new stdClass();
$schema->system->settings = new stdClass();
$schema = (new SchemaConverter())->parseSchema(
    $schema,
    [
        'type' => 'container',
        'description' => 'TYPO3 Core Settings',
        'items' => $data,
    ],
    '',
    $defaultConfiguration
);

echo Yaml::dump($schema, 99, 2, Yaml::DUMP_OBJECT | Yaml::DUMP_OBJECT_AS_MAP);

class SchemaConverter
{
    private function parseContainer(object $schema, array $data, string $ns, array $default): object
    {
        foreach ($data['items'] as $propertyName => $propertyData) {
            $name = $ns === '' ? '' : ($ns . '.');
            $name .= addcslashes($propertyName, '.');
            //$name .= str_contains($propertyName, '.') ? '"' . $propertyName . '"' : $propertyName;
            $this->parseSchema($schema, $propertyData, $name, $default[$propertyName] ?? null);
        }
        return $schema;
    }

    private function parseText(object $schema, array $data, string $ns, string|int $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        if ($default !== null && is_int($default)) {
            $setting->type = 'integer';
        } elseif ($default !== null && !is_string($default)) {
            fprintf(STDERR, "%s\n", var_export($setting, true));
            exit;
        }
        $setting->default = $default;
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseMultiline(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        $setting->default = $default;
        $schema->system->settings->{$ns} = $setting;
        // @todo define type for multiline Textfield
        return $schema;
    }

    private function parseBool(object $schema, array $data, string $ns, bool|int $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'boolean';
        if ($default === 0) {
            $default = false;
        }
        if ($default === 1) {
            $default = true;
        }
        if ($default !== null && !is_bool($default)) {
            fprintf(STDERR, "%s\n", var_export($setting, true));
            exit;
        }
        $setting->default = $default;
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseInt(object $schema, array $data, string $ns, int $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'integer';
        if (isset($data['allowedValues'])) {
            $setting->enum = $data['allowedValues'];
        }
        $setting->default = $default;
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseDropdown(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        $setting->enum = $data['allowedValues'];
        $setting->default = $default;
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseArray(object $schema, array $data, string $ns, array|string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'stringlist';
        if (is_string($default)) {
            $default = explode(',', $default);
        }
        if ($default !== null && $default !== array_values($default)) {
            $setting->type = 'stringarray';
            if ($default !== null) {
                $setting->default = new stdClass();
                foreach ($default as $propertyName => $value) {
                    $setting->default->{$propertyName} = $value;
                }
            }
            fprintf(STDERR, "warning: %s is not a real array\n", $setting->label);
        } else {
            $setting->default = $default;
        }
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseMixed(object $schema, array $data, string $ns, string|bool $default = null): object
    {
        // @todo is there any difference between mixed and string?
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        if (is_bool($default)) {
            $setting->type = 'boolean';
        }
        $setting->default = $default;
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseList(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'list';
        if ($default !== null) {
            $setting->default = $default;
        }
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parsePassword(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'password';
        if ($default !== null) {
            $setting->default = $default;
        }
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parsePhpClass(object $schema, array $data, string $ns, string $default = null): object
    {
        // @todo is there any difference between phpClass and string?
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        if ($default !== null) {
            $setting->default = $default;
        }
        $schema->system->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseErrors(object $schema, array $data, string $ns, int $default = null): object
    {
        // @todo is there any difference between errors and number
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'number';
        if ($default !== null) {
            $setting->default = $default;
        }
        return $schema;
    }

    private function createSetting(string $ns, array $data): object
    {
        $setting = new stdClass();
        $props = explode('.', $ns);
        $title = array_pop($props);
        $setting->label = $title;
        if (isset($data['description'])) {
            $setting->description = $data['description'];
        }
        return $setting;
    }

    public function parseSchema(object $schema, array $data, string $ns, mixed $default = null): object
    {
        $type = $data['type'] ?? '';
        //if (isset($data['description'])) {
        //    $schema->label = $data['description'];
        //}
        return match ($data['type']) {
            'container' => $this->parseContainer($schema, $data, $ns, $default),
            'text' => $this->parseText($schema, $data, $ns, $default),
            'multiline' => $this->parseMultiline($schema, $data, $ns, $default),
            'bool' => $this->parseBool($schema, $data, $ns, $default),
            'int' => $this->parseInt($schema, $data, $ns, $default),
            'array' => $this->parseArray($schema, $data, $ns, $default),
            'dropdown' => $this->parseDropdown($schema, $data, $ns, $default),
            'mixed' => $this->parseMixed($schema, $data, $ns, $default),
            'list' => $this->parseList($schema, $data, $ns, $default),
            'password' => $this->parsePassword($schema, $data, $ns, $default),
            'phpClass' => $this->parsePhpClass($schema, $data, $ns, $default),
            'errors' => $this->parseErrors($schema, $data, $ns, $default),
            //default => $schema,
            default => throw new \LogicException('Unhandled type ' . $type),
        };
    }
}
