import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';

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
class UploadForm {
    constructor() {
        this.expandedUploadFormClass = 'transformed';
    }
    initializeEvents() {
        // Show upload form
        $(document).on('click', '.t3js-upload', (event) => {
            const $me = $(event.currentTarget);
            const $uploadForm = $('.extension-upload-form');
            event.preventDefault();
            if ($me.hasClass(this.expandedUploadFormClass)) {
                $uploadForm.stop().slideUp();
                $me.removeClass(this.expandedUploadFormClass);
            }
            else {
                $me.addClass(this.expandedUploadFormClass);
                $uploadForm.stop().slideDown();
                new AjaxRequest($me.attr('href')).get().then(async (response) => {
                    $uploadForm.find('.t3js-upload-form-target').html(await response.resolve());
                });
            }
        });
    }
}

export default UploadForm;
