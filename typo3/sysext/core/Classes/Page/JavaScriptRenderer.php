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

namespace TYPO3\CMS\Core\Page;

use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;

class JavaScriptRenderer
{
    protected string $handlerUri;
    protected JavaScriptItems $items;
    protected ImportMap $importMap;
    protected int $javaScriptModuleInstructionFlags = 0;

    public static function create(string $uri = null): self
    {
        $instance = GeneralUtility::makeInstance(static::class);
        if ($uri !== null) {
            $instance->setHandlerUri($uri);
        }
        return $instance;
    }

    public function __construct(
        PackageManager $packageManager,
        FrontendInterface $assetsCache,
        string $cacheIdentifier
    ) {
        $this->importMap = GeneralUtility::makeInstance(
            ImportMap::class,
            $packageManager->getActivePackages(),
            $assetsCache,
            $cacheIdentifier
        );
        $this->items = GeneralUtility::makeInstance(JavaScriptItems::class);
        $this->handlerUri = PathUtility::getPublicResourceWebPath('EXT:core/Resources/Public/JavaScript/JavaScriptItemHandler.js');
    }

    protected function setHandlerUri(string $uri)
    {
        $this->handlerUri = $uri;
    }

    public function addGlobalAssignment(array $payload): void
    {
        $this->items->addGlobalAssignment($payload);
    }

    public function addJavaScriptModuleInstruction(JavaScriptModuleInstruction $instruction): void
    {
        if ($instruction->shallLoadImportMap()) {
            $this->importMap->includeImportsFor($instruction->getName());
        }
        if ($instruction->shallLoadRequireJs()) {
            // @todo: wrapInto a common mapRequireJsModuleNameToEs6()?
            $url = $this->importMap->resolveImport($instruction->getName() . '.js');

            if ($url) {
                // @todo: Map instruction to an ImportMap instruction? (to avoid loading requirejs if not actually required)
                $this->javaScriptModuleInstructionFlags |= JavaScriptModuleInstruction::FLAG_LOAD_IMPORTMAP;
            } else {
                // if no modules were included, the RequireJS module is not yet
                // backed by an ES6 replacement, therefore we load all importmap configurations,
                // in order for all dependencies to be loadable.
                // But we do only do this for logged in backend users (to avoid extension-list disclosure)
                // @todoinclude all imports but only if BE and beUserLoggedIn
            }
        }
        $this->javaScriptModuleInstructionFlags |= $instruction->getFlags();
        $this->items->addJavaScriptModuleInstruction($instruction);
    }

    public function includeAllImports(): void
    {
        $this->importMap->includeAllImports();
    }

    /**
     * @return list<array{type: string, payload: mixed}>
     * @internal
     */
    public function toArray(): array
    {
        if ($this->isEmpty()) {
            return [];
        }
        return $this->items->toArray();
    }

    public function render(): string
    {
        if ($this->isEmpty()) {
            return '';
        }
        return $this->createScriptElement([
            'src' => $this->handlerUri,
            'async' => 'async',
        ], $this->jsonEncode($this->toArray()));
    }

    public function renderImportMap(string $nonce): string
    {
        return $this->importMap->render($nonce);
    }

    protected function isEmpty(): bool
    {
        return $this->items->isEmpty();
    }

    protected function createScriptElement(array $attributes, string $textContent = ''): string
    {
        if (empty($attributes)) {
            return '';
        }
        $attributesPart = GeneralUtility::implodeAttributes($attributes, true);
        // actual JSON payload is stored as comment in `script.textContent`
        return sprintf('<script %s>/* %s */</script>', $attributesPart, $textContent);
    }

    protected function jsonEncode($value): string
    {
        return (string)json_encode($value, JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG);
    }
}
