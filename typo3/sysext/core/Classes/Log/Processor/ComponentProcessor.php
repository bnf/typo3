<?php

declare(strict_types=1);
namespace TYPO3\CMS\Core\Log\Processor;

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

use Monolog\Processor\ProcessorInterface;

class ComponentProcessor implements ProcessorInterface
{
    public function __invoke(array $record): array
    {
        if (isset($record['context']['__TYPO3_COMPONENT'])) {
            $record['extra']['component'] = $record['context']['__TYPO3_COMPONENT'];
            unset($record['context']['__TYPO3_COMPONENT']);
        }

        return $record;
    }
}
