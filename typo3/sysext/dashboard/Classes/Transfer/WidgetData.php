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

namespace TYPO3\CMS\Dashboard\Transfer;

class WidgetData implements \JsonSerializable
{
    public function __construct(
        private readonly string $identifier,
        private readonly string $type,
        private readonly string $height,
        private readonly string $width,
        private readonly string $label,
        private readonly string $content,
        private readonly array $options,
        private readonly array $eventdata,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'identifier' => $this->identifier,
            'type' => $this->type,
            'height' => $this->height,
            'width' => $this->width,
            'label' => $this->label,
            'content' => $this->content,
            'options' => $this->options,
            'eventdata' => $this->eventdata,
        ];
    }
}
