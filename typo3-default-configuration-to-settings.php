<?php

declare(strict_types=1);
require 'vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;

$fileName = 'typo3/sysext/core/Configuration/DefaultConfigurationDescription.yaml';
$data = Yaml::parseFile($fileName);
$defaultConfiguration = require('typo3/sysext/core/Configuration/DefaultConfiguration.php');

$schema = new stdClass();

$schema->categories = new stdClass();

$schema->categories->sys = new stdClass();
$schema->categories->sys->label = 'System';
$schema->categories->sys->description = '';
$schema->categories->sys->icon = '';

$schema->categories->{'sys.features'} = new stdClass();
$schema->categories->{'sys.features'}->label = 'Feature Toggles';
$schema->categories->{'sys.features'}->description = '';
$schema->categories->{'sys.features'}->icon = '';
$schema->categories->{'sys.features'}->parent = 'sys';

$schema->categories->{'sys.lang'} = new stdClass();
$schema->categories->{'sys.lang'}->label = 'Language';
$schema->categories->{'sys.lang'}->description = '';
$schema->categories->{'sys.lang'}->icon = '';
$schema->categories->{'sys.lang'}->parent = 'sys';

$schema->categories->be = new stdClass();
$schema->categories->be->label = 'Backend';
$schema->categories->be->description = '';
$schema->categories->be->icon = '';

$schema->categories->{'be.passwordhashing'} = new stdClass();
$schema->categories->{'be.passwordhashing'}->label = 'Password Hashing';
$schema->categories->{'be.passwordhashing'}->description = '';
$schema->categories->{'be.passwordhashing'}->icon = '';
$schema->categories->{'be.passwordhashing'}->parent = 'be';

$schema->categories->fe = new stdClass();
$schema->categories->fe->label = 'Frontend';
$schema->categories->fe->description = '';
$schema->categories->fe->icon = '';

$schema->categories->{'fe.passwordhashing'} = new stdClass();
$schema->categories->{'fe.passwordhashing'}->label = 'Password Hashing';
$schema->categories->{'fe.passwordhashing'}->description = '';
$schema->categories->{'fe.passwordhashing'}->icon = '';
$schema->categories->{'fe.passwordhashing'}->parent = 'fe';

$schema->categories->{'fe.cachehash'} = new stdClass();
$schema->categories->{'fe.cachehash'}->label = 'Cache Hash';
$schema->categories->{'fe.cachehash'}->description = '';
$schema->categories->{'fe.cachehash'}->icon = '';
$schema->categories->{'fe.cachehash'}->parent = 'fe';

$schema->categories->gfx = new stdClass();
$schema->categories->gfx->label = 'Graphics';
$schema->categories->gfx->description = '';
$schema->categories->gfx->icon = '';

$schema->categories->mail = new stdClass();
$schema->categories->mail->label = 'Mail';
$schema->categories->mail->description = '';
$schema->categories->mail->icon = '';

$schema->categories->http = new stdClass();
$schema->categories->http->label = 'HTTP';
$schema->categories->http->description = '';
$schema->categories->http->icon = '';

$schema->categories->extensions = new stdClass();
$schema->categories->extensions->label = 'Extensions';
$schema->categories->extensions->description = '';
$schema->categories->extensions->icon = '';

//$schema->version = 1;
$schema->settings = new stdClass();
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

echo Yaml::dump($schema, 99, 2, Yaml::DUMP_OBJECT_AS_MAP | Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE | Yaml::DUMP_EXCEPTION_ON_INVALID_TYPE);

class SchemaConverter
{
    private function parseContainer(object $schema, array $data, string $ns, array $default): object
    {
        $category = $ns ? strtolower($ns) : null;
        $category = match($category) {
            'ext' => 'extensions',
            default => $category,
        };
        foreach ($data['items'] as $propertyName => $propertyData) {
            $name = $ns === '' ? '' : ($ns . '.');
            $name .= addcslashes($propertyName, '.');
            //$name .= str_contains($propertyName, '.') ? '"' . $propertyName . '"' : $propertyName;
            $this->parseSchema($schema, $propertyData, $name, $default[$propertyName] ?? null, $category);
        }
        return $schema;
    }

    private function parseText(object $schema, array $data, string $ns, string|int $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        if ($default !== null && is_int($default)) {
            $setting->type = 'int';
        } elseif ($default !== null && !is_string($default)) {
            fprintf(STDERR, "%s\n", var_export($setting, true));
            exit;
        }
        $setting->default = $default;
        $schema->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseMultiline(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        $setting->default = $default;
        $schema->settings->{$ns} = $setting;
        // @todo define type for multiline Textfield
        return $schema;
    }

    private function parseBool(object $schema, array $data, string $ns, bool|int $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'bool';
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
        $schema->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseInt(object $schema, array $data, string $ns, int $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'int';
        if (isset($data['allowedValues'])) {
            $setting->enum = $data['allowedValues'];
        }
        $setting->default = $default;
        $schema->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseDropdown(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        $setting->enum = $data['allowedValues'];
        $setting->default = $default;
        $schema->settings->{$ns} = $setting;
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
            $setting->type = 'stringmap';
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
        $schema->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseMixed(object $schema, array $data, string $ns, string|array|bool $default = null): object
    {
        // @todo is there any difference between mixed and string?
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'mixed';
        /*
        if (is_bool($default)) {
            $setting->type = 'bool';
        }
        */
        $setting->default = $default;
        $schema->settings->{$ns} = $setting;
        return $schema;
    }

    private function parseList(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'string';
        if ($default !== null) {
            $setting->default = $default;
        }
        $schema->settings->{$ns} = $setting;
        return $schema;
    }

    private function parsePassword(object $schema, array $data, string $ns, string $default = null): object
    {
        $setting = $this->createSetting($ns, $data);
        $setting->type = 'password';
        if ($default !== null) {
            $setting->default = $default;
        }
        $schema->settings->{$ns} = $setting;
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
        $schema->settings->{$ns} = $setting;
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
        $words = preg_split('/(?<=[a-z])(?=[A-Z])/', str_replace('_', ' ', $title));

        $uppercaseWords = array_map(ucwords(...), [
            'smtp',
            'ssl',
            'mfa',
            'ip',
            'dsn',
            'jpg',
        ]);
        $uppercasePatterns = array_map(fn (string $x): string => '/(^| )(' . preg_quote($x, '/') . ')($| )/', $uppercaseWords);
        $setting->label = str_replace(
            ['Typo Script', 'Ddmmyy', 'Hhmm', 'Webp'],
            ['TypoScript', 'Format of dates', 'Format of times', 'WebP'],
            preg_replace_callback(
                $uppercasePatterns,
                fn (array $x): string => $x[1] . strtoupper($x[2]) . $x[3],
                ucwords(implode(' ', $words))
            )
        );
        if (isset($data['description'])) {
            $setting->description = $data['description'];
        }
        return $setting;
    }

    public function parseSchema(object $schema, array $data, string $ns, mixed $default = null, ?string $category = null): object
    {
        $type = $data['type'] ?? '';
        //if (isset($data['description'])) {
        //    $schema->label = $data['description'];
        //}
        $object = match ($data['type']) {
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
        if ($data['readonly'] ?? false) {
            $object->settings->{$ns}->readonly = true;
        }
        if ($category !== null) {
            if (isset($object->settings->{$ns})) {
                $object->settings->{$ns}->category = $category;
            }
        }
        return $object;
    }
}
