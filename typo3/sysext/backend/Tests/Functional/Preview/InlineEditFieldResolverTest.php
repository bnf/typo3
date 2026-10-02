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

namespace TYPO3\CMS\Backend\Tests\Functional\Preview;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Backend\Preview\InlineEditFieldResolver;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class InlineEditFieldResolverTest extends FunctionalTestCase
{
    private const DEFAULT_CONFIGURATION = [
        'mod' => [
            'web_layout' => [
                'inlineEditing' => [
                    'enabled' => '1',
                    'fields' => [
                        'default' => 'header, subheader, bodytext, assets, image, media',
                    ],
                ],
            ],
        ],
    ];
    protected bool $initializeDatabase = false;

    private function createBackendUser(bool $isAdmin, array $allowedExcludeFields = []): BackendUserAuthentication
    {
        $backendUser = self::createStub(BackendUserAuthentication::class);
        $backendUser->method('isAdmin')->willReturn($isAdmin);
        $backendUser->method('check')->willReturnCallback(
            static fn(string $type, string $value): bool => $isAdmin || ($type === 'non_exclude_fields' && in_array($value, $allowedExcludeFields, true))
        );
        return $backendUser;
    }

    #[Test]
    public function defaultFieldsAreReducedToFieldsShownByRecordType(): void
    {
        $subject = $this->get(InlineEditFieldResolver::class);
        $backendUser = $this->createBackendUser(true);

        self::assertSame(
            ['header', 'subheader', 'bodytext'],
            $subject->resolve('tt_content', 'text', self::DEFAULT_CONFIGURATION, $backendUser)
        );
        self::assertSame(
            ['header', 'subheader'],
            $subject->resolve('tt_content', 'header', self::DEFAULT_CONFIGURATION, $backendUser)
        );
    }

    #[Test]
    public function recordTypeSpecificFieldsOverrideDefaultFields(): void
    {
        $configuration = self::DEFAULT_CONFIGURATION;
        $configuration['mod']['web_layout']['inlineEditing']['fields']['text'] = 'bodytext';

        self::assertSame(
            ['bodytext'],
            $this->get(InlineEditFieldResolver::class)->resolve('tt_content', 'text', $configuration, $this->createBackendUser(true))
        );
    }

    #[Test]
    public function typeFieldAndUnknownFieldsAreRemoved(): void
    {
        $configuration = self::DEFAULT_CONFIGURATION;
        $configuration['mod']['web_layout']['inlineEditing']['fields']['text'] = 'CType, doesNotExist, bodytext, bodytext';

        self::assertSame(
            ['bodytext'],
            $this->get(InlineEditFieldResolver::class)->resolve('tt_content', 'text', $configuration, $this->createBackendUser(true))
        );
    }

    #[Test]
    public function excludeFieldsWithoutPermissionAreRemoved(): void
    {
        $subject = $this->get(InlineEditFieldResolver::class);

        self::assertSame(
            ['header', 'bodytext'],
            $subject->resolve('tt_content', 'text', self::DEFAULT_CONFIGURATION, $this->createBackendUser(false))
        );
        self::assertSame(
            ['header', 'subheader', 'bodytext'],
            $subject->resolve('tt_content', 'text', self::DEFAULT_CONFIGURATION, $this->createBackendUser(false, ['tt_content:subheader']))
        );
    }

    #[Test]
    public function fieldsDisabledByPageTsConfigAreRemoved(): void
    {
        $configuration = self::DEFAULT_CONFIGURATION;
        $configuration['TCEFORM']['tt_content']['subheader']['disabled'] = '1';
        $configuration['TCEFORM']['tt_content']['bodytext']['types']['text']['disabled'] = '1';
        $subject = $this->get(InlineEditFieldResolver::class);
        $backendUser = $this->createBackendUser(true);

        self::assertSame(
            ['header'],
            $subject->resolve('tt_content', 'text', $configuration, $backendUser)
        );
        self::assertSame(
            ['header', 'bodytext', 'assets'],
            $subject->resolve('tt_content', 'textmedia', $configuration, $backendUser)
        );
    }

    #[Test]
    public function noFieldsAreResolvedIfInlineEditingIsDisabled(): void
    {
        $configuration = self::DEFAULT_CONFIGURATION;
        $configuration['mod']['web_layout']['inlineEditing']['enabled'] = '0';

        self::assertSame(
            [],
            $this->get(InlineEditFieldResolver::class)->resolve('tt_content', 'text', $configuration, $this->createBackendUser(true))
        );
    }

    #[Test]
    public function noFieldsAreResolvedForUnknownTable(): void
    {
        self::assertSame(
            [],
            $this->get(InlineEditFieldResolver::class)->resolve('tx_does_not_exist', 'text', self::DEFAULT_CONFIGURATION, $this->createBackendUser(true))
        );
    }
}
