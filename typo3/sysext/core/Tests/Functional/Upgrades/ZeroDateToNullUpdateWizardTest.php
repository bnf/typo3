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

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Upgrades\ZeroDateToNullUpdateWizard;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ZeroDateToNullUpdateWizardTest extends FunctionalTestCase
{
    private const string MYSQL_MODE = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_VALUE_ON_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_IN_DATE,ONLY_FULL_GROUP_BY';

    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_datahandler_datetime',
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_datahandler_datetime_legacy',
    ];

    private bool $isMySql;

    protected function setUp(): void
    {
        // Same sql_mode the testing framework sets up for MySQL/MariaDB, except that `NO_ZERO_DATE`
        // is left out to set up "0000-00-00" values. SQLite holds them as text anyway.
        $this->isMySql = in_array(getenv('typo3DatabaseDriver') ?: 'mysqli', ['mysqli', 'pdo_mysql'], true);
        if ($this->isMySql) {
            $this->configurationToUseInTestInstance['DB']['Connections']['Default']['initCommands'] = 'SET SESSION sql_mode = \'' . self::MYSQL_MODE . '\';';
        }
        parent::setUp();
    }

    #[Group('not-postgres')]
    #[Test]
    public function zeroDatesOfNullableFieldsAreUpdatedToNull(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/ZeroDateToNullUpdateWizardBase.csv');
        if ($this->isMySql) {
            // Run the wizard in the sql_mode of a system that no longer accepts new zero dates.
            $this->get(ConnectionPool::class)
                ->getConnectionByName(ConnectionPool::DEFAULT_CONNECTION_NAME)
                ->executeStatement('SET SESSION sql_mode = \'' . self::MYSQL_MODE . ',NO_ZERO_DATE\'');
        }
        $subject = $this->get(ZeroDateToNullUpdateWizard::class);

        self::assertTrue($subject->updateNecessary());
        self::assertSame(
            'Nullable date fields holding the zero date "0000-00-00" that need to be updated to NULL:' . LF
            . 'tx_testdatahandler_datetime.datetime_native (affects 1 rows)' . LF
            . 'tx_testdatahandler_datetime.date_native (affects 1 rows)' . LF
            . 'tx_testdatahandler_datetime.datetimesec_native (affects 1 rows)',
            $subject->getDescription()
        );
        $subject->executeUpdate();
        self::assertFalse($subject->updateNecessary());
        $this->assertCSVDataSet(__DIR__ . '/Fixtures/ZeroDateToNullUpdateWizardMigrated.csv');
    }

    #[Test]
    public function noUpdateIsNecessaryWithoutZeroDates(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/ZeroDateToNullUpdateWizardWithoutZeroDates.csv');
        self::assertFalse($this->get(ZeroDateToNullUpdateWizard::class)->updateNecessary());
    }
}
