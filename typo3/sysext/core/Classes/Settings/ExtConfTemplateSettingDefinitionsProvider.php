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

namespace TYPO3\CMS\Core\Settings;

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\TypoScript\AST\CommentAwareAstBuilder;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\TypoScript\AST\Traverser\AstTraverser;
use TYPO3\CMS\Core\TypoScript\AST\Visitor\AstConstantCommentVisitor;
use TYPO3\CMS\Core\TypoScript\Tokenizer\LosslessTokenizer;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
final class ExtConfTemplateSettingDefinitionsProvider
{
    public function __construct(
        private readonly PackageManager $packageManager,
        private readonly CommentAwareAstBuilder $astBuilder,
        private readonly LosslessTokenizer $losslessTokenizer,
        private readonly AstTraverser $astTraverser,
    ) {}

    public function loadExtConfTemplateTxt(SettingsDefinitionsCollection $settingsDefinitionsCollection): void
    {
        $activePackages = $this->packageManager->getActivePackages();

        $extensionsWithConfigurations = [];
        foreach ($activePackages as $extensionKey => $activePackage) {
            $extConfTemplate = $activePackage->getPackagePath() . 'ext_conf_template.txt';
            if (!file_exists($extConfTemplate)) {
                continue;
            }
            $fileContents = @file_get_contents($extConfTemplate);
            if ($fileContents === false) {
                continue;
            }

            $ast = $this->astBuilder->build($this->losslessTokenizer->tokenize($fileContents), new RootNode());
            $astConstantCommentVisitor = new AstConstantCommentVisitor();
            $this->astTraverser->traverse($ast, [$astConstantCommentVisitor]);
            $constants = $astConstantCommentVisitor->getConstants();

            $displayConstants = [];
            foreach ($constants as $constant) {
                $displayConstants[$constant['cat']][$constant['subcat_sorting_first']]['label'] = $constant['subcat_label'];
                $displayConstants[$constant['cat']][$constant['subcat_sorting_first']]['items'][$constant['subcat_sorting_second']] = $constant;
            }
            foreach ($displayConstants as &$constantCategory) {
                ksort($constantCategory);
                foreach ($constantCategory as &$constantDetailItems) {
                    ksort($constantDetailItems['items']);
                }
            }
            $extensionsWithConfigurations[$extensionKey] = $displayConstants;
        }

        $definitions = [];
        $categoryDefinitions = [];
        foreach ($extensionsWithConfigurations as $extensionKey => $constantCategories) {
            $extensionTitle = $this->packageManager->getPackage($extensionKey)->getPackageMetaData()->getTitle();
            $categoryDefinition = $this->createCategory($extensionKey, $extensionTitle, 'basic');
            $categoryDefinitions[$categoryDefinition->key] = $categoryDefinition;
            foreach ($constantCategories as $category => $subcategories) {
                $categoryDefinition = $this->createCategory($extensionKey, $extensionTitle, $category);
                $categoryDefinitions[$categoryDefinition->key] = $categoryDefinition;

                foreach ($subcategories as $subcategory) {
                    foreach ($subcategory['items'] as $setting) {
                        $type = $setting['type'];
                        $default = $setting['default_value'];
                        $enum = [];
                        $label = $setting['label'];
                        $description = $setting['description'];
                        if ($setting['typeHint'] ?? '') {
                            if ($description) {
                                $description .= ' (' . $setting['typeHint'] . ')';
                            } else {
                                $description = $setting['typeHint'];
                            }
                        }
                        if ($setting['name'] === 'disablePageTsContentElements') {
                            //\TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($setting);
                            //exit;
                        }
                        switch ($type) {
                            case 'int':
                                $default = (int)$default;
                                break;
                            case 'int+':
                                // @todo typeIntPlusMin, typeIntPlusMax
                                $type = 'int';
                                $default = (int)$default;
                                break;
                            case 'small':
                                $type = 'string';
                                break;
                            case 'options':
                                $type = 'string';
                                $enum = [];
                                foreach ($setting['labelValueArray'] as $option) {
                                    $enum[$option['value']] = $option['label'];
                                }
                                break;
                            case 'boolean':
                                $type = 'bool';
                                $default = (bool)$default;
                                if ($setting['trueValue'] !== '1') {
                                    $type = 'string';
                                    $default = $setting['default_value'];
                                    $enum = ['0', $setting['trueValue']];
                                }
                                break;
                        }
                        $definitions[] = new SettingDefinition(
                            key: 'EXTENSIONS.' . $extensionKey . '.' . $setting['name'],
                            type: $type,
                            label: $label,
                            description: $description,
                            default: $default,
                            enum: $enum,
                            category: $categoryDefinition->key,
                        );
                    }
                }
            }
        }

        if (count($categoryDefinitions) > 0) {
            $categoryDefinitions['extensions'] = new CategoryDefinition(
                key: 'extensions',
                label: 'Extensions',
            );
        }

        $settingsDefinitionsCollection->addCategoryDefinitions(...$categoryDefinitions);
        array_map(static fn($definition) => $settingsDefinitionsCollection->addDefinition('system', $definition), $definitions);
    }

    private function createCategory(string $extensionKey, string $extensionTitle, string $category): CategoryDefinition
    {
        $parent = 'extensions';
        $key = 'extensions.' . $extensionKey;
        // Ugly hack
        $label = str_replace('TYPO3 CMS ', '', $extensionTitle);
        if ($category !== 'basic') {
            $label = ucwords($category);
            $parent = $key;
            $key .= '.' . str_replace(' ', '', $category);
        }

        return new CategoryDefinition(
            key: $key,
            label: $label,
            parent: $parent,
        );
    }
}
