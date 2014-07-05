<?php
defined('TYPO3_MODE') or die();

if (TYPO3_MODE === 'BE') {
	$opendocsPath = \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('opendocs');
	// Register toolbar item
	$GLOBALS['TYPO3_CONF_VARS']['typo3/backend.php']['additionalBackendItems'][] = $opendocsPath . 'registerToolbarItem.php';
	// Register AJAX calls
	\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerAjaxHandler('OpendocsController::renderMenu', 'TYPO3\\CMS\\Opendocs\\Controller\\OpendocsController->renderAjax');
	\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerAjaxHandler('OpendocsController::closeDocument', 'TYPO3\\CMS\\Opendocs\\Controller\\OpendocsController->closeDocument');
	// Register update signal to update the number of open documents
	$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['t3lib/class.t3lib_befunc.php']['updateSignalHook']['OpendocsController::updateNumber'] = 'TYPO3\\CMS\\Opendocs\\Controller\\OpendocsController->updateNumberOfOpenDocsHook';
}
