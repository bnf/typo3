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

use TYPO3\CMS\Extbase\DomainObject\AbstractValueObject;

/**
 * A value object over some storage variants of DateTimeStorage, every date left empty.
 */
class DateTimeValue extends AbstractValueObject
{
    protected ?\DateTime $intNotNull = null;
    protected ?\DateTime $intNullable = null;
    protected ?\DateTime $textNotNull = null;
    protected ?\DateTime $timeNotNull = null;
    protected ?\DateTime $intInconsistentSqlNull = null;
}
