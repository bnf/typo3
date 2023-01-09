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

namespace TYPO3\CMS\Backend\Security\ContentSecurityPolicy;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class CspReport implements \JsonSerializable
{
    public readonly CspScope $scope;
    public readonly \DateTimeImmutable $timestamp;
    public readonly ?string $requestId;
    public readonly ?array $details;

    protected static function toCamelCase(string $value): string
    {
        return lcfirst(str_replace('-', '', ucwords($value, '-')));
    }

    public static function fromArray(array $array): self
    {
        $target = new self();
        $target->scope = CspScope::from($array['scope'] ?? '');
        $target->timestamp = new \DateTimeImmutable('@' . ($array['tstamp'] ?? '0'));
        $target->requestId = $array['request_id'] ?? null;
        $report = json_decode($array['details'] ?? '', true, 16, JSON_THROW_ON_ERROR);
        $report = $report['csp-report'] ?? [];
        $report = array_combine(
            array_map('self::toCamelCase', array_keys($report)),
            array_values($report)
        );
        $target->details = $report ?: null;
        return $target;
    }

    public function jsonSerialize(): mixed
    {
        return [
            'scope' => $this->scope,
            'timestamp' => $this->timestamp->format(\DateTimeInterface::ATOM),
            'requestId' => $this->requestId,
            'details' => $this->details,
        ];
    }
}
