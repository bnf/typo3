<?php

use TYPO3\CMS\Kai\Controller\ApiController;

return [
    'kai_suggest' => [
        'path' => '/kai/suggest',
        'target' => ApiController::class . '::suggest',
        'methods' => ['POST'],
    ],
];
