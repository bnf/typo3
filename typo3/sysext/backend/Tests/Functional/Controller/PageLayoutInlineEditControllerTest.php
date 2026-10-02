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

namespace TYPO3\CMS\Backend\Tests\Functional\Controller;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Backend\Controller\PageLayoutInlineEditController;
use TYPO3\CMS\Backend\Routing\Route;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class PageLayoutInlineEditControllerTest extends FunctionalTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/be_users.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/PageLayoutInlineEdit/records.csv');
        $backendUser = $this->setUpBackendUser(1);
        $GLOBALS['LANG'] = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
    }

    private function createRequest(string $method, array $queryParams, ?array $parsedBody = null): ServerRequest
    {
        $request = new ServerRequest('https://example.com/typo3/ajax/page-layout/inline-edit', $method)
            ->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE)
            ->withAttribute('route', new Route('/ajax/page-layout/inline-edit', ['_identifier' => 'ajax_page_layout_inline_edit']))
            ->withQueryParams($queryParams);
        $request = $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
        if ($parsedBody !== null) {
            $request = $request->withParsedBody($parsedBody);
        }
        $GLOBALS['TYPO3_REQUEST'] = $request;
        return $request;
    }

    #[Test]
    public function formActionRendersRelevantFieldsOfRecordOnly(): void
    {
        $response = $this->get(PageLayoutInlineEditController::class)->formAction(
            $this->createRequest('GET', ['table' => 'tt_content', 'uid' => 1])
        );

        self::assertSame(200, $response->getStatusCode());
        $result = json_decode((string)$response->getBody(), true);
        self::assertStringContainsString('data[tt_content][1][header]', $result['html']);
        self::assertStringContainsString('data[tt_content][1][bodytext]', $result['html']);
        self::assertStringNotContainsString('data[tt_content][1][CType]', $result['html']);
        self::assertStringNotContainsString('data[tt_content][1][colPos]', $result['html']);
        self::assertSame('Text element', $result['title']);
        self::assertStringContainsString('/record/edit', $result['editUrl']);
        self::assertStringContainsString('/record/edit/contextual', $result['contextualEditUrl']);
    }

    #[Test]
    public function formActionIsDeniedIfInlineEditingIsDisabledForPage(): void
    {
        $response = $this->get(PageLayoutInlineEditController::class)->formAction(
            $this->createRequest('GET', ['table' => 'tt_content', 'uid' => 2])
        );

        self::assertSame(403, $response->getStatusCode());
    }

    #[Test]
    public function formActionIsDeniedForUnknownRecord(): void
    {
        $response = $this->get(PageLayoutInlineEditController::class)->formAction(
            $this->createRequest('GET', ['table' => 'tt_content', 'uid' => 4711])
        );

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function saveActionPersistsSubmittedData(): void
    {
        $response = $this->get(PageLayoutInlineEditController::class)->saveAction(
            $this->createRequest('POST', ['table' => 'tt_content', 'uid' => 1], [
                'data' => [
                    'tt_content' => [
                        1 => [
                            'header' => 'Updated header',
                        ],
                    ],
                ],
            ])
        );

        self::assertSame(200, $response->getStatusCode());
        $result = json_decode((string)$response->getBody(), true);
        self::assertTrue($result['success']);
        self::assertSame('Updated header', $result['title']);
        $this->assertCSVDataSet(__DIR__ . '/Fixtures/PageLayoutInlineEdit/updated.csv');
    }

    #[Test]
    public function saveActionRequiresDataOfEditedRecord(): void
    {
        $response = $this->get(PageLayoutInlineEditController::class)->saveAction(
            $this->createRequest('POST', ['table' => 'tt_content', 'uid' => 1], [
                'data' => [
                    'tt_content' => [
                        2 => [
                            'header' => 'Updated header',
                        ],
                    ],
                ],
            ])
        );

        self::assertSame(400, $response->getStatusCode());
    }
}
