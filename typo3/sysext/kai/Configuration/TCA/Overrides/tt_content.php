<?php

defined('TYPO3') or die();

// @todo should all text fields be auto-enabled(?)
// @todo should this be enabled per user/group
//
// @todo integrator configuration
//
// @todo $GLOBALS['TCA']['tt_content']['columns']['header']['config']['ai']['capatbilities'] = […]
$GLOBALS['TCA']['tt_content']['columns']['header']['config']['fieldControl']['kaiSuggest'] = [
    'renderType' => 'kaiSuggest',
    'disabled' => false,
];
$GLOBALS['TCA']['tt_content']['columns']['subheader']['config']['fieldControl']['kaiSuggest'] = [
    'renderType' => 'kaiSuggest',
    'disabled' => false,
];
$GLOBALS['TCA']['tt_content']['columns']['bodytext']['config']['fieldControl']['kaiSuggest'] = [
    'renderType' => 'kaiSuggest',
    'disabled' => false,
];

// @todo image styles vs image providers
