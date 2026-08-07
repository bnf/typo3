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

namespace TYPO3Tests\BlogExample\Domain\Model;

use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;

/**
 * One nullable property per storage variant of a TCA type=datetime column.
 */
class DateTimeStorage extends AbstractEntity
{
    protected ?\DateTime $intNotNull = null;
    protected ?\DateTime $intNullable = null;
    protected ?\DateTime $intDatetimesec = null;
    protected ?\DateTime $datetimeNullable = null;
    protected ?\DateTime $dateNullable = null;
    protected ?\DateTime $timeNullable = null;
    protected ?\DateTime $textNotNull = null;
    protected ?\DateTime $intLegacyNull = null;
    protected ?\DateTime $dateNotNull = null;
    protected ?\DateTime $datetimeNotNull = null;
    protected ?\DateTime $timeNotNull = null;

    public function getIntNotNull(): ?\DateTime
    {
        return $this->intNotNull;
    }

    public function setIntNotNull(?\DateTime $intNotNull): void
    {
        $this->intNotNull = $intNotNull;
    }

    public function getIntNullable(): ?\DateTime
    {
        return $this->intNullable;
    }

    public function setIntNullable(?\DateTime $intNullable): void
    {
        $this->intNullable = $intNullable;
    }

    public function getIntDatetimesec(): ?\DateTime
    {
        return $this->intDatetimesec;
    }

    public function setIntDatetimesec(?\DateTime $intDatetimesec): void
    {
        $this->intDatetimesec = $intDatetimesec;
    }

    public function getDatetimeNullable(): ?\DateTime
    {
        return $this->datetimeNullable;
    }

    public function setDatetimeNullable(?\DateTime $datetimeNullable): void
    {
        $this->datetimeNullable = $datetimeNullable;
    }

    public function getDateNullable(): ?\DateTime
    {
        return $this->dateNullable;
    }

    public function setDateNullable(?\DateTime $dateNullable): void
    {
        $this->dateNullable = $dateNullable;
    }

    public function getTimeNullable(): ?\DateTime
    {
        return $this->timeNullable;
    }

    public function setTimeNullable(?\DateTime $timeNullable): void
    {
        $this->timeNullable = $timeNullable;
    }

    public function getDateNotNull(): ?\DateTime
    {
        return $this->dateNotNull;
    }

    public function setDateNotNull(?\DateTime $dateNotNull): void
    {
        $this->dateNotNull = $dateNotNull;
    }

    public function getDatetimeNotNull(): ?\DateTime
    {
        return $this->datetimeNotNull;
    }

    public function setDatetimeNotNull(?\DateTime $datetimeNotNull): void
    {
        $this->datetimeNotNull = $datetimeNotNull;
    }

    public function getTimeNotNull(): ?\DateTime
    {
        return $this->timeNotNull;
    }

    public function setTimeNotNull(?\DateTime $timeNotNull): void
    {
        $this->timeNotNull = $timeNotNull;
    }

    public function getIntLegacyNull(): ?\DateTime
    {
        return $this->intLegacyNull;
    }

    public function setIntLegacyNull(?\DateTime $intLegacyNull): void
    {
        $this->intLegacyNull = $intLegacyNull;
    }

    public function getTextNotNull(): ?\DateTime
    {
        return $this->textNotNull;
    }

    public function setTextNotNull(?\DateTime $textNotNull): void
    {
        $this->textNotNull = $textNotNull;
    }
}
