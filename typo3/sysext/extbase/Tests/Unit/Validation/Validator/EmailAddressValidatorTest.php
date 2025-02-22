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

namespace TYPO3\CMS\Extbase\Tests\Unit\Validation\Validator;

use TYPO3\CMS\Extbase\Validation\Validator\EmailAddressValidator;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Test case
 */
class EmailAddressValidatorTest extends UnitTestCase
{
    /**
     * @test
     */
    public function emailAddressValidatorReturnsNoErrorsForAValidEmailAddress(): void
    {
        $subject = $this->getMockBuilder(EmailAddressValidator::class)
            ->onlyMethods(['translateErrorMessage'])
            ->getMock();
        self::assertFalse($subject->validate('valid.email@example.com')->hasErrors());
    }

    /**
     * @test
     */
    public function emailAddressValidatorReturnsFalseForAnInvalidEmailAddress(): void
    {
        $subject = $this->getMockBuilder(EmailAddressValidator::class)
            ->onlyMethods(['translateErrorMessage'])
            ->getMock();
        self::assertTrue($subject->validate('@typo3.org')->hasErrors());
    }

    /**
     * @test
     */
    public function emailAddressValidatorReturnsFalseForNonStringAddress(): void
    {
        $subject = $this->getMockBuilder(EmailAddressValidator::class)
            ->onlyMethods(['translateErrorMessage'])
            ->getMock();
        self::assertTrue($subject->validate(123)->hasErrors());
    }

    /**
     * @test
     */
    public function emailValidatorCreatesTheCorrectErrorForAnInvalidEmailAddress(): void
    {
        $subject = $this->getMockBuilder(EmailAddressValidator::class)
            ->onlyMethods(['translateErrorMessage'])
            ->getMock();
        self::assertCount(1, $subject->validate('someone@typo3.')->getErrors());
    }
}
