import $ from 'jquery';
import '../../../../backend/Resources/Public/JavaScript/Input/Clearable.mjs';

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
 * Module: TYPO3/CMS/Filelist/RenameFile
 * Modal to pick the required conflict strategy for colliding filenames
 * @exports TYPO3/CMS/Filelist/RenameFile
 */
class FileSearch {
    constructor() {
        $(() => {
            let searchField;
            if ((searchField = document.querySelector('input[name="tx_filelist_file_filelistlist[searchWord]"]')) !== null) {
                const searchResultShown = ('' !== searchField.value);
                // make search field clearable
                searchField.clearable({
                    onClear: (input) => {
                        if (searchResultShown) {
                            input.closest('form').submit();
                        }
                    },
                });
            }
        });
    }
}
var FileSearch$1 = new FileSearch();

export default FileSearch$1;
