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

namespace TYPO3\CMS\Core\Tests\Functional\Mcp;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Mcp\ServeCommand;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ServeCommandTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users.csv');
        $backendUser = $this->setUpBackendUser(1);
        $GLOBALS['LANG'] = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
    }

    #[Test]
    public function actsAsCurrentBackendUserWithoutUserOption(): void
    {
        $tester = $this->executeWhoami([]);

        self::assertSame(Command::SUCCESS, $tester->getStatusCode());
        self::assertSame('admin', $this->getWhoamiResult($tester));
    }

    #[Test]
    public function actsAsBackendUserGivenByUserOption(): void
    {
        $tester = $this->executeWhoami(['--user' => 'editor']);

        self::assertSame(Command::SUCCESS, $tester->getStatusCode());
        self::assertSame('editor', $this->getWhoamiResult($tester));
    }

    #[Test]
    public function keepsStoredSettingsOfBackendUserGivenByUserOption(): void
    {
        $this->executeWhoami(['--user' => 'editor']);

        $uc = $this->get(ConnectionPool::class)
            ->getConnectionForTable('be_users')
            ->select(['uc'], 'be_users', ['uid' => 2])
            ->fetchOne();
        // PostgreSQL returns bytea columns as stream resources
        $uc = is_resource($uc) ? (string)stream_get_contents($uc) : (string)$uc;
        self::assertSame('kept', unserialize($uc, ['allowed_classes' => false])['mcpTestUc'] ?? null);
    }

    public static function unavailableUserDataProvider(): array
    {
        return [
            'unknown user' => ['unknown-editor'],
            'disabled user' => ['disabled-editor'],
            'deleted user' => ['deleted-editor'],
        ];
    }

    #[Test]
    #[DataProvider('unavailableUserDataProvider')]
    public function failsForUnavailableBackendUser(string $username): void
    {
        $tester = $this->executeWhoami(['--user' => $username]);

        self::assertSame(Command::FAILURE, $tester->getStatusCode());
        self::assertSame('', $tester->getDisplay());
        self::assertStringContainsString($username, $tester->getErrorOutput());
    }

    private function executeWhoami(array $options): CommandTester
    {
        $tester = new CommandTester($this->get(ServeCommand::class));
        $tester->setInputs([
            json_encode([
                'jsonrpc' => '2.0',
                'id' => 1,
                'method' => 'tools/call',
                'params' => [
                    'name' => 'fetch_test_whoami',
                    'arguments' => new \stdClass(),
                ],
            ]),
        ]);
        $tester->execute($options, ['capture_stderr_separately' => true]);
        return $tester;
    }

    private function getWhoamiResult(CommandTester $tester): string
    {
        $reply = json_decode(trim($tester->getDisplay()), false, 512, JSON_THROW_ON_ERROR);
        return $reply->result->structuredContent->data;
    }
}
