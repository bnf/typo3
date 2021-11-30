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
 * Module: TYPO3/CMS/Impexp/ContextMenuActions
 *
 * JavaScript to handle import/export actions from context menu
 * @exports TYPO3/CMS/Impexp/ContextMenuActions
 */
class ContextMenuActions {
    exportT3d(table, uid) {
        if (table === 'pages') {
            top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.ImportExport.exportModuleUrl +
                '&id=' + uid +
                '&tx_impexp[pagetree][id]=' + uid +
                '&tx_impexp[pagetree][levels]=0' +
                '&tx_impexp[pagetree][tables][]=_ALL');
        }
        else {
            top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.ImportExport.exportModuleUrl +
                '&tx_impexp[record][]=' + table + ':' + uid +
                '&tx_impexp[external_ref][tables][]=_ALL');
        }
    }
    importT3d(table, uid) {
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.ImportExport.importModuleUrl +
            '&id=' + uid +
            '&table=' + table);
    }
}
var ContextMenuActions$1 = new ContextMenuActions();

export default ContextMenuActions$1;
