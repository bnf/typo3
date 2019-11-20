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
use Monolog\ResettableInterface;
use TYPO3\CMS\Core\Core\RequestId;

class RequestIdProcessor implements ProcessorInterface, ResettableInterface
{
    private RequestId $requestId;

    public function __construct(RequestId $requestId)
    {
        $this->requestId = $requestId;
    }

    /**
     * {@inheritDoc}
     */
    public function __invoke(array $record): array
    {
        $record['extra']['requestId'] = (string)$this->requestId;

        return $record;
    }

    public function reset()
    {
        $this->requestId = new RequestId();
    }
}
