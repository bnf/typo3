<?php
declare(strict_types = 1);

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

/**
 * @internal
 */
final class LegacyLogFormatProcessor implements \Monolog\Processor\ProcessorInterface
{
    /**
     * @param array $record
     * @return array
     */
    public function __invoke(array $record)
    {
        $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 6);
        $caller = array_pop($backtrace);
        $record['context']['component'] = $caller['class'] ?? [];

        $record['context']['request_id'] = \TYPO3\CMS\Core\Core\RequestId::get();

        return $record;
    }
}
