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

namespace TYPO3\CMS\Core\Tests\Acceptance\Application\InstallTool;

use TYPO3\CMS\Core\Crypto\PasswordHashing\Argon2iPasswordHash;
use TYPO3\CMS\Core\Crypto\PasswordHashing\InvalidPasswordHashException;
use TYPO3\CMS\Core\Tests\Acceptance\Support\ApplicationTester;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class AbstractCest
{
    public const ENABLE_INSTALL_TOOL_FILE = 'ENABLE_INSTALL_TOOL';
    public const ADDITIONAL_CONFIGURATION_FILE = 'AdditionalConfiguration.php';
    public const INSTALL_TOOL_PASSWORD = 'temporary password';

    public function _before(ApplicationTester $I): void
    {
        $I->amOnPage('typo3/install.php');
    }

    public function _after(ApplicationTester $I): void
    {
        $I->click('Logout');
        // Make sure logout has finished
        $I->waitForText('The Install Tool is locked', 20);

        $I->amGoingTo('clean up created files');
        if (getenv('TYPO3_ACCEPTANCE_INSTALLTOOL_PW_PRESET') !== '1') {
            unlink(getenv('TYPO3_ACCEPTANCE_PATH_CONFIG') . '/' . self::ADDITIONAL_CONFIGURATION_FILE);
        }

        $I->dontSeeFileFound($this->getEnableInstallToolFilePath());
        if (getenv('TYPO3_ACCEPTANCE_INSTALLTOOL_PW_PRESET') !== '1') {
            $I->dontSeeFileFound(getenv('TYPO3_ACCEPTANCE_PATH_CONFIG') . '/' . self::ADDITIONAL_CONFIGURATION_FILE);
        }
    }

    protected function getEnableInstallToolFilePath(): string
    {
        return getenv('TYPO3_ACCEPTANCE_PATH_CONFIG') . '/' . self::ENABLE_INSTALL_TOOL_FILE;
    }

    protected function logIntoInstallTool(ApplicationTester $I): void
    {
        $password = $this->setInstallToolPassword($I);

        printf("write to file: %s\n", $this->getEnableInstallToolFilePath());
        $I->writeToFile($this->getEnableInstallToolFilePath(), '');
        $I->reloadPage();
        $I->waitForElementVisible('#t3-install-form-password');
        $I->fillField('#t3-install-form-password', $password);
        $I->click('Login');
        $I->waitForText('Maintenance');
    }

    /**
     * @throws InvalidPasswordHashException
     */
    private function setInstallToolPassword(ApplicationTester $I): string
    {
        $password = self::INSTALL_TOOL_PASSWORD;
        if (getenv('TYPO3_ACCEPTANCE_INSTALLTOOL_PW_PRESET') === '1') {
            return $password;
        }
        $hashMethod = GeneralUtility::makeInstance(Argon2iPasswordHash::class);
        $hashedPassword = $hashMethod->getHashedPassword($password);
        $I->writeToFile(
            getenv('TYPO3_ACCEPTANCE_PATH_CONFIG') . '/' . self::ADDITIONAL_CONFIGURATION_FILE,
            '<?php' . PHP_EOL . '$GLOBALS[\'TYPO3_CONF_VARS\'][\'BE\'][\'installToolPassword\'] = \'' . $hashedPassword . '\';'
        );
        return $password;
    }
}
