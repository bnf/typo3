<?php
namespace TYPO3\CMS\Core;

use function DI\autowire;

return [
    Console\CommandApplication::class => autowire(),
];
