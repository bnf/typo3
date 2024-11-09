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

namespace TYPO3\CMS\Core\Tests\Acceptance\Application\FormEngine;

use Codeception\Example;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Facebook\WebDriver\Remote\RemoteWebElement;
use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverKeys;
use TYPO3\CMS\Core\Tests\Acceptance\Support\ApplicationTester;

/**
 * Abstract class for "elements_basic" tests of styleguide
 */
abstract class AbstractElementsBasicCest
{
    /**
     * Method to run basic elements input field test details
     *
     * @param string|null $initializedInputFieldXpath - only used in ElementsBasicInputDateCest until flatpickr is gone
     */
    protected function runInputFieldTest(ApplicationTester $I, Example $testData, ?string $initializedInputFieldXpath = null): void
    {
        $fieldLabel = $testData['label'];
        $initializedInputFieldXpath ??= '(//label/code[contains(text(),"[' . $fieldLabel . ']")]/..)'
            . '[1]/parent::*//*/input[@data-formengine-input-name][@data-formengine-input-initialized]';

        // Wait until JS initialized everything
        $I->waitForElement($initializedInputFieldXpath, 10);

        $formSection = $this->getFormSectionByFieldLabel($I, $fieldLabel);
        $inputField = $this->getInputField($formSection);
        $hiddenField = $this->getHiddenField($formSection, $inputField);

        if ($testData['comment'] !== '') {
            $I->comment($testData['comment']);
        }

        if ($testData['checkNullCheckbox'] ?? false) {
            $I->checkOption($this->getNullCheckboxField($formSection));
        }

        $I->fillField($inputField, $testData['inputValue']);
        // Change focus to trigger validation
        $inputField->sendKeys(WebDriverKeys::TAB);
        // Press ESC so that any opened popup (potentially from the field below) is closed
        $inputField->sendKeys(WebDriverKeys::ESCAPE);
        $I->waitForElementNotVisible('#t3js-ui-block');

        $I->comment('Test value of visible and hidden field before save');
        $I->seeInField($inputField, $testData['expectedValue']);
        $I->seeInField($hiddenField, $testData['expectedInternalValue']);

        $I->comment('Save the form');
        $saveButtonLink = '//*/button[@name="_savedok"][1]';
        $I->waitForElement($saveButtonLink, 30);
        $I->click($saveButtonLink);
        $I->waitForElementNotVisible('#t3js-ui-block');
        $I->waitForElement('//*/button[@name="_savedok"][not(@disabled)][1]', 30);
        $I->waitForElement($initializedInputFieldXpath, 30);

        // Find the fields again (after reload of iFrame)
        $formSection = $this->getFormSectionByFieldLabel($I, $fieldLabel);
        $inputField = $this->getInputField($formSection);
        $hiddenField = $this->getHiddenField($formSection, $inputField);

        // Validate save was successful
        $I->comment('Test value of visible and hidden field after save');
        $I->seeInField($inputField, $testData['expectedInternalValueAfterSave'] ?? $testData['expectedValue']);
        $I->seeInField($hiddenField, $testData['expectedValueAfterSave']);
    }

    /**
     * Return the visible input field of element in question.
     */
    protected function getInputField(RemoteWebElement $formSection): RemoteWebElement
    {
        return $formSection->findElement(WebDriverBy::xpath('.//*/input[@data-formengine-input-name]'));
    }

    /**
     * Return the hidden input field of element in question.
     */
    protected function getHiddenField(RemoteWebElement $formSection, RemoteWebElement $inputField): RemoteWebElement
    {
        $hiddenFieldXPath = './/*/input[@name="' . $inputField->getAttribute('data-formengine-input-name') . '"]';
        return $formSection->findElement(WebDriverBy::xpath($hiddenFieldXPath));
    }

    /**
     * Return the "Set value" checkbox of a nullable field of element in question.
     */
    protected function getNullCheckboxField(RemoteWebElement $formSection): RemoteWebElement
    {
        return $formSection->findElement(WebDriverBy::xpath('.//*/div[@class="form-check t3-form-field-eval-null-checkbox"]/input[@type="checkbox"]'));
    }

    /**
     * Find this element in form.
     */
    protected function getFormSectionByFieldLabel(ApplicationTester $I, string $fieldLabel): RemoteWebElement
    {
        $I->comment('Get context for field "' . $fieldLabel . '"');
        return $I->executeInSelenium(
            static function (RemoteWebDriver $webDriver) use ($fieldLabel) {
                return $webDriver->findElement(
                    WebDriverBy::xpath(
                        '(//code[contains(text(),"[' . $fieldLabel . ']")]/..)[1]/ancestor::fieldset[@class="form-section"][1]'
                    )
                );
            }
        );
    }
}
