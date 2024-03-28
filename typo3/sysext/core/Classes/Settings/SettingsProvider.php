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

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;
use TYPO3\CMS\Core\TypoScript\AST\CommentAwareAstBuilder;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\TypoScript\AST\Traverser\AstTraverser;
use TYPO3\CMS\Core\TypoScript\AST\Visitor\AstConstantCommentVisitor;
use TYPO3\CMS\Core\TypoScript\Tokenizer\LosslessTokenizer;

class SettingsProvider
{
    public function __construct(
        private ContainerInterface $container,
        private SettingsRegistry $settingsRegistry,
    ) {}

    public function loadSettingsDefinitions(string $path)
    {
        $this->loadSettingsSchema($path);
        $this->loadEtConfTemplateTxt($path);
    }


    private function loadSettingsSchema(string $path): void
    {
        $settingsSchema = $path . 'Configuration/Settings.schema.yaml';
        if (!file_exists($settingsSchema)) {
            return;
        }
        $yamlFileLoader = $this->container->get(YamlFileLoader::class);
        $definitions = $yamlFileLoader->load($settingsSchema, YamlFileLoader::PROCESS_IMPORTS, true);
        $version = (int)($definitions['version'] ?? 0);
        if ($version !== 1) {
            throw new \RuntimeException('Settings schema version 1 expected. Filename: ' . $settingsSchema, 1711025983);
        }
        unset($definitions['version']);
        $this->settingsRegistry->addDefinitions($definitions);
    }

    private function loadEtConfTemplateTxt(string $path): void
    {
        $extConfTemplate = $path . 'ext_conf_template.txt';
        if (!file_exists($extConfTemplate)) {
            return;
        }
        $definitions = [];

        $astBuilder = $this->container->get(CommentAwareAstBuilder::class);
        $astTraverser = $this->container->get(AstTraverser::class);
        $losslessTokenizer = $this->container->get(LosslessTokenizer::class);

        $fileContents = @file_get_contents($extConfTemplate);
        if ($fileContents === false) {
            return;
        }

        $ast = $astBuilder->build($losslessTokenizer->tokenize($fileContents), new RootNode());
        $astConstantCommentVisitor = new AstConstantCommentVisitor();
        $astTraverser->traverse($ast, [$astConstantCommentVisitor]);
        $constants = $astConstantCommentVisitor->getConstants();
        var_dump($constants);
        // @todo: It would be better to fetch all LocalConfiguration settings of an extension at once
        //        and feed it as pseudo-TS to the AST builder. This way the full AstConstantCommentVisitor
        //        preparation magic would kick in and the JS-side processing in extension-configuration.ts
        //        could be removed (especially the 'wrap' and 'offset' stuff) by handling it in fluid directly.
        /*
        foreach ($constants as $constantName => &$constantDetails) {

            try {
                //$valueFromLocalConfiguration = $extensionConfiguration->get($extensionKey, str_replace('.', '/', $constantName));
                //$constantDetails['value'] = $valueFromLocalConfiguration;
            } catch (ExtensionConfigurationPathDoesNotExistException $e) {
                // Deliberately empty - it can happen at runtime that a written config does not return
                // back all values (eg. saltedpassword with its userFuncs), which then miss in the written
                // configuration and are only synced after next install tool run. This edge case is
                // taken care of here.
            }
        }
         */
        $displayConstants = [];
        foreach ($constants as $constant) {
            $displayConstants[$constant['cat']][$constant['subcat_sorting_first']]['label'] = $constant['subcat_label'];
            $displayConstants[$constant['cat']][$constant['subcat_sorting_first']]['items'][$constant['subcat_sorting_second']] = $constant;
        }
        var_dump($displayConstants);
        exit;
        foreach ($displayConstants as &$constantCategory) {
            ksort($constantCategory);
            foreach ($constantCategory as &$constantDetailItems) {
                ksort($constantDetailItems['items']);
            }
        }
        $extensionsWithConfigurations[$extensionKey] = $displayConstants;

        $this->settingsRegistry->addDefinitions($definitions);
    }
}
