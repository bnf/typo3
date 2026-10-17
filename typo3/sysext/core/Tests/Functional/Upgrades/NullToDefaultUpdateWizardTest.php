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

namespace TYPO3\CMS\Core\Tests\Functional\Upgrades;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Platforms\SQLitePlatform;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Upgrades\NullToDefaultUpdateWizard;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class NullToDefaultUpdateWizardTest extends FunctionalTestCase
{
    protected array $coreExtensionsToLoad = ['install'];

    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_notnull_to_default',
    ];

    private string $baseDataSet = __DIR__ . '/Fixtures/NullToDefaultUpdateWizardBase.csv';
    private string $fullMigrationResultDataSet = __DIR__ . '/Fixtures/NullToDefaultUpdateWizardMigrated.csv';

    protected function setUp(): void
    {
        // Same sql_mode the testing framework sets up for MySQL/MariaDB, except that `NO_ZERO_DATE`
        // is left out, as a native date that is not nullable stores no date as "0000-00-00".
        if (in_array(getenv('typo3DatabaseDriver') ?: 'mysqli', ['mysqli', 'pdo_mysql'], true)) {
            $this->configurationToUseInTestInstance['DB']['Connections']['Default']['initCommands'] = 'SET SESSION sql_mode = \''
                . 'STRICT_ALL_TABLES'
                . ',ERROR_FOR_DIVISION_BY_ZERO'
                . ',NO_AUTO_VALUE_ON_ZERO'
                . ',NO_ENGINE_SUBSTITUTION'
                . ',NO_ZERO_IN_DATE'
                . ',ONLY_FULL_GROUP_BY'
                . '\';';
        }
        parent::setUp();
    }

    #[Test]
    public function nullValuesAreUpdated(): void
    {
        $subject = $this->get(NullToDefaultUpdateWizard::class);

        $connection = $this->get(ConnectionPool::class)->getConnectionByName(ConnectionPool::DEFAULT_CONNECTION_NAME);

        // Change tx_testnotnulltodefault_example_user.image to NULL(able)
        // in order for schema migrator to pick up migration to NOT NULL
        // as defined in test_notnull_to_default/ext_tables.sql
        if ($connection->getDatabasePlatform() instanceof SQLitePlatform) {
            $connection->executeStatement('DROP TABLE "tx_testnotnulltodefault_example_user"');
            $connection->executeStatement('CREATE TABLE "tx_testnotnulltodefault_example_user" ("uid" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "image" VARCHAR(255) DEFAULT NULL, "files" INTEGER UNSIGNED DEFAULT NULL, "birthday" DATE DEFAULT NULL, "start_time" TIME DEFAULT NULL)');
        } elseif ($connection->getDatabasePlatform() instanceof PostgreSQLPlatform) {
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user ALTER image TYPE VARCHAR');
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user ALTER image SET DEFAULT NULL');
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user ALTER image DROP NOT NULL');
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user ALTER birthday DROP NOT NULL');
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user ALTER start_time DROP NOT NULL');
        } else {
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user CHANGE image image TINYTEXT DEFAULT NULL');
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user CHANGE birthday birthday DATE DEFAULT NULL');
            $connection->executeStatement('ALTER TABLE tx_testnotnulltodefault_example_user CHANGE start_time start_time TIME DEFAULT NULL');
        }

        $this->importCSVDataSet($this->baseDataSet);

        self::assertTrue($subject->updateNecessary());
        $subject->executeUpdate();
        self::assertFalse($subject->updateNecessary());

        // tx_testnotnulltodefault_example_user.image should have been updated
        // tx_testnotnulltodefault_example_user.files kept as is
        // birthday and start_time get the empty value of a native date, which PostgreSQL cannot
        // hold for a DATE column
        if ($connection->getDatabasePlatform() instanceof PostgreSQLPlatform) {
            $this->fullMigrationResultDataSet = __DIR__ . '/Fixtures/NullToDefaultUpdateWizardMigratedPostgres.csv';
        }
        $this->assertCSVDataSet($this->fullMigrationResultDataSet);

        // Just ensure that running the upgrade again does not change anything
        $subject->executeUpdate();
        $this->assertCSVDataSet($this->fullMigrationResultDataSet);
    }
}
