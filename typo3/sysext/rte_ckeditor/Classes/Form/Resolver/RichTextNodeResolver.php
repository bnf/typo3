<?php

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

namespace TYPO3\CMS\RteCKEditor\Form\Resolver;

use Psr\EventDispatcher\EventDispatcherInterface;
use TYPO3\CMS\Backend\Form\NodeFactory;
use TYPO3\CMS\Backend\Form\NodeInterface;
use TYPO3\CMS\Backend\Form\NodeProviderInterface;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\RteCKEditor\Form\Element\RichTextElement;

/**
 * This resolver will return the RichTextElement render class if RTE is enabled for this field.
 * @internal This is a specific Backend FormEngine implementation and is not considered part of the Public TYPO3 API.
 */
class RichTextNodeResolver implements NodeProviderInterface
{
    /**
     * @var EventDispatcherInterface
     */
    private $eventDispatcher;

    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * Returns RichTextElement object if RTE widget should be rendered.
     *
     * @param NodeFactory $nodeFactory
     * @param array $data
     * @return NodeInterface|null
     */
    public function create(NodeFactory $nodeFactory, array $data): ?NodeInterface
    {
        $parameterArray = $data['parameterArray'];
        $backendUser = $this->getBackendUserAuthentication();
        if (// This field is not read only
            !$parameterArray['fieldConf']['config']['readOnly']
            // If RTE is generally enabled by user settings and RTE object registry can return something valid
            && $backendUser->isRTE()
            // If RTE is enabled for field
            && isset($parameterArray['fieldConf']['config']['enableRichtext'])
            && (bool)$parameterArray['fieldConf']['config']['enableRichtext'] === true
            // If RTE config is found (prepared by TcaText data provider)
            && isset($parameterArray['fieldConf']['config']['richtextConfiguration'])
            && is_array($parameterArray['fieldConf']['config']['richtextConfiguration'])
            // If RTE is not disabled on configuration level
            && !$parameterArray['fieldConf']['config']['richtextConfiguration']['disabled']
        ) {
            return new RichTextElement($nodeFactory, $data, $this->eventDispatcher);
        }
        return null;
    }

    /**
     * @return BackendUserAuthentication
     */
    protected function getBackendUserAuthentication()
    {
        return $GLOBALS['BE_USER'];
    }
}
