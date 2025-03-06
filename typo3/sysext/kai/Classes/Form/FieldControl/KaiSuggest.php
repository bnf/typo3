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

namespace TYPO3\CMS\Kai\Form\FieldControl;

use TYPO3\CMS\Backend\Form\AbstractNode;
use TYPO3\CMS\Core\Exception\SiteNotFoundException;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Site\Entity\NullSite;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\Utility\StringUtility;

/**
 * Renders a widget to suggest values via KAI
 *
 * @internal
 */
class KaiSuggest extends AbstractNode
{
    public function __construct(
        private SiteFinder $siteFinder,
    ) {}

    public function render(): array
    {
        $options = $this->data['renderData']['fieldControlOptions'];
        $itemName = (string)$this->data['parameterArray']['itemFormElName'];
        $id = StringUtility::getUniqueId('t3js-formengine-fieldcontrol-');

        // Handle options and fallback
        //$title = $options['title'] ?? 'LLL:EXT:kai/Resources/Private/Language/locallang.xlf:labels.kaiSuggest';
        $title = 'KAI Suggest';
        $site = $this->data['request']->getAttribute('site');
        $pageId = $this->data['effectivePid'];
        if ($site instanceof NullSite) {
            try {
                $site = $this->siteFinder->getSiteByPageId($pageId);
            } catch (SiteNotFoundException $e) {
                return [];
            }
        }

        $linkAttributes = [
            'id' => $id,
            'data-item-name' => $itemName,
            'data-site' => $site->getIdentifier(),
        ];

        if ($options['promptPrefix'] ?? '') {
            $linkAttributes['data-propmpt-prefix'] = $options['promptPrefix'];
        }

        return [
            'iconIdentifier' => 'actions-dice',
            'title' => $title,
            'linkAttributes' => $linkAttributes,
            'javaScriptModules' => [
                JavaScriptModuleInstruction::create('@typo3/kai/form-engine/field-control/kai-suggest.js')->instance($id),
            ],
        ];
    }
}
