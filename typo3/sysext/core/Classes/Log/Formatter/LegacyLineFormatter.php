<?php
declare(strict_types = 1);

namespace TYPO3\CMS\Core\Log\Formatter;

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

use Monolog\Formatter\LineFormatter;

/**
 * A formatter that formats log lines according the the log format of the TYPO3 logging framework
 * which is now considered legacy.
 */
class LegacyLineFormatter extends LineFormatter
{
    public function __construct(bool $allowInlineLineBreaks = false, bool $ignoreEmptyContextAndExtra = false)
    {
        parent::__construct(
            "%datetime% [%level_name%] request=\"%context.request_id%\" component=\"%context.component%\": %message% %context% %extra%\n",
            'r',
            $allowInlineLineBreaks,
            $ignoreEmptyContextAndExtra
        );
    }
}

//date('r', (int)$this->created);
//$logRecordString = sprintf(
//    '%s [%s] request="%s" component="%s": %s %s',
//    $timestamp,
//    $levelName,
//    $this->requestId,
//    $this->component,
//    $this->message,
//    $data
//);
