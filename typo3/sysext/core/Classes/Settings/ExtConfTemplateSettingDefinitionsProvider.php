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

    public function loadExtConfTemplateTxt(SettingsRegistry $settingsRegistry): void
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
            $astConstantCommentVisitor = new AstConstantCommentVisitor(false);
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
        foreach ($extensionsWithConfigurations as $extensionKey => $constantCategories) {
            foreach ($constantCategories as $category => $subcategories) {
                foreach ($subcategories as $subcategory) {
                    foreach ($subcategory['items'] as $setting) {
                        $definitions[] = new SettingDefinition(
                            key: $extensionKey . '.' . $setting['name'],
                            type: $setting['type'],
                            label: $setting['label'],
                            description: $setting['description'],
                            default: $setting['default_value'],
                            //category: $category,
                        );
                    }
                }
            }
        }

        array_map(static fn($definition) => $settingsRegistry->addDefinition('extension', $definition), $definitions);
    }
}
