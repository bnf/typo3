import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import SecurityUtility from '../../../../core/Resources/Public/JavaScript/SecurityUtility.esm.js';
import Severity from '../../../../backend/Resources/Public/JavaScript/Severity.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import NProgress from '../../../../core/Resources/Public/JavaScript/Contrib/nprogress.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import tooltipObject from '../../../../backend/Resources/Public/JavaScript/Tooltip.esm.js';
import DebounceEvent from '../../../../core/Resources/Public/JavaScript/Event/DebounceEvent.esm.js';
import '../../../../backend/Resources/Public/JavaScript/Input/Clearable.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/tablesort.esm.js';
import Repository from './Repository.esm.js';
import ExtensionManagerUpdate from './Update.esm.js';
import UploadForm from './UploadForm.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/tablesort.dotsep.esm.js';

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
const securityUtility = new SecurityUtility();
var ExtensionManagerIdentifier;
(function (ExtensionManagerIdentifier) {
    ExtensionManagerIdentifier["extensionlist"] = "typo3-extension-list";
    ExtensionManagerIdentifier["searchField"] = "#Tx_Extensionmanager_extensionkey";
})(ExtensionManagerIdentifier || (ExtensionManagerIdentifier = {}));
/**
 * Module: TYPO3/CMS/Extensionmanager/Main
 * main logic holding everything together, consists of multiple parts
 * ExtensionManager => Various functions for displaying the extension list / sorting
 * Repository => Various AJAX functions for TER downloads
 * ExtensionManager.Update => Various AJAX functions to display updates
 * ExtensionManager.uploadForm => helper to show the upload form
 */
class ExtensionManager {
    constructor() {
        const me = this;
        jQuery(() => {
            this.Update = new ExtensionManagerUpdate();
            this.UploadForm = new UploadForm();
            this.Repository = new Repository();
            const extensionList = document.getElementById(ExtensionManagerIdentifier.extensionlist);
            if (extensionList !== null) {
                new Tablesort(extensionList);
                new RegularEvent('click', function (e) {
                    e.preventDefault();
                    Modal.confirm(TYPO3.lang['extensionList.removalConfirmation.title'], TYPO3.lang['extensionList.removalConfirmation.question'], Severity.error, [
                        {
                            text: TYPO3.lang['button.cancel'],
                            active: true,
                            btnClass: 'btn-default',
                            trigger: () => {
                                Modal.dismiss();
                            },
                        }, {
                            text: TYPO3.lang['button.remove'],
                            btnClass: 'btn-danger',
                            trigger: () => {
                                me.removeExtensionFromDisk(this);
                                Modal.dismiss();
                            },
                        },
                    ]);
                }).delegateTo(extensionList, '.removeExtension');
            }
            jQuery(document).on('click', '.onClickMaskExtensionManager', () => {
                NProgress.start();
            }).on('click', 'a[data-action=update-extension]', (e) => {
                e.preventDefault();
                NProgress.start();
                new AjaxRequest(jQuery(e.currentTarget).attr('href')).get().then(this.updateExtension);
            }).on('change', 'input[name=unlockDependencyIgnoreButton]', (e) => {
                const $actionButton = jQuery('.t3js-dependencies');
                $actionButton.toggleClass('disabled', !jQuery(e.currentTarget).prop('checked'));
            });
            let searchField;
            if ((searchField = document.querySelector(ExtensionManagerIdentifier.searchField)) !== null) {
                new RegularEvent('submit', (e) => {
                    e.preventDefault();
                }).bindTo(searchField.closest('form'));
                new DebounceEvent('keyup', (e) => {
                    this.filterExtensions(e.target);
                }, 100).bindTo(searchField);
                searchField.clearable({
                    onClear: (input) => {
                        this.filterExtensions(input);
                    },
                });
            }
            jQuery(document).on('click', '.t3-button-action-installdistribution', () => {
                NProgress.start();
            });
            this.Repository.initDom();
            this.Update.initializeEvents();
            this.UploadForm.initializeEvents();
            tooltipObject.initialize('#typo3-extension-list [title]', {
                delay: {
                    show: 500,
                    hide: 100,
                },
                trigger: 'hover',
                container: 'body',
            });
        });
    }
    static getUrlVars() {
        let vars = [];
        let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (let hash of hashes) {
            const [k, v] = hash.split('=');
            vars.push(k);
            vars[k] = v;
        }
        return vars;
    }
    filterExtensions(input) {
        const filterableColumns = document.querySelectorAll('[data-filterable]');
        const columnIndices = [];
        filterableColumns.forEach((element) => {
            const children = Array.from(element.parentElement.children);
            columnIndices.push(children.indexOf(element));
        });
        const columnQuerySelectors = columnIndices.map((index) => `td:nth-child(${index + 1})`).join(',');
        const rows = document.querySelectorAll('#typo3-extension-list tbody tr');
        rows.forEach((row) => {
            const columns = row.querySelectorAll(columnQuerySelectors);
            const values = [];
            columns.forEach((column) => {
                values.push(column.textContent.trim().replace(/\s+/g, ' '));
            });
            row.classList.toggle('hidden', input.value !== '' && !RegExp(input.value, 'i').test(values.join(':')));
        });
    }
    removeExtensionFromDisk(trigger) {
        NProgress.start();
        new AjaxRequest(trigger.href).get().then(() => {
            location.reload();
        }).finally(() => {
            NProgress.done();
        });
    }
    async updateExtension(response) {
        let i = 0;
        const data = await response.resolve();
        const $form = jQuery('<form>');
        jQuery.each(data.updateComments, (version, comment) => {
            const $input = jQuery('<input>').attr({ type: 'radio', name: 'version' }).val(version);
            if (i === 0) {
                $input.attr('checked', 'checked');
            }
            $form.append([
                jQuery('<h3>').append([
                    $input,
                    ' ' + securityUtility.encodeHtml(version),
                ]),
                jQuery('<div>')
                    .append(comment
                    .replace(/(\r\n|\n\r|\r|\n)/g, '\n')
                    .split(/\n/).map((line) => {
                    return securityUtility.encodeHtml(line);
                })
                    .join('<br>')),
            ]);
            i++;
        });
        const $container = jQuery('<div>').append([
            jQuery('<h1>').text(TYPO3.lang['extensionList.updateConfirmation.title']),
            jQuery('<h2>').text(TYPO3.lang['extensionList.updateConfirmation.message']),
            $form,
        ]);
        NProgress.done();
        Modal.confirm(TYPO3.lang['extensionList.updateConfirmation.questionVersionComments'], $container, Severity.warning, [
            {
                text: TYPO3.lang['button.cancel'],
                active: true,
                btnClass: 'btn-default',
                trigger: () => {
                    Modal.dismiss();
                },
            }, {
                text: TYPO3.lang['button.updateExtension'],
                btnClass: 'btn-warning',
                trigger: () => {
                    NProgress.start();
                    new AjaxRequest(data.url).withQueryArguments({
                        tx_extensionmanager_tools_extensionmanagerextensionmanager: {
                            version: jQuery('input:radio[name=version]:checked', Modal.currentModal).val(),
                        }
                    }).get().finally(() => {
                        location.reload();
                    });
                    Modal.dismiss();
                },
            },
        ]);
    }
}
let extensionManagerObject = new ExtensionManager();
if (typeof TYPO3.ExtensionManager === 'undefined') {
    TYPO3.ExtensionManager = extensionManagerObject;
}

export default extensionManagerObject;
