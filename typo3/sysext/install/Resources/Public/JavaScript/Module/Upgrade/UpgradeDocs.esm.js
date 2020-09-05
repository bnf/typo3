import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import jQuery$1 from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import DebounceEvent from '../../../../../../core/Resources/Public/JavaScript/Event/DebounceEvent.esm.js';
import Router from '../../Router.esm.js';
import { AbstractInteractableModule } from '../AbstractInteractableModule.esm.js';
import '../../Renderable/Clearable.esm.js';

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
 * Module: TYPO3/CMS/Install/Module/UpgradeDocs
 */
class UpgradeDocs extends AbstractInteractableModule {
    constructor() {
        super(...arguments);
        this.selectorFulltextSearch = '.t3js-upgradeDocs-fulltext-search';
        this.selectorChosenField = '.t3js-upgradeDocs-chosen-select';
        this.selectorChangeLogsForVersionContainer = '.t3js-version-changes';
        this.selectorChangeLogsForVersion = '.t3js-changelog-list';
        this.selectorUpgradeDoc = '.t3js-upgrade-doc';
    }
    static trimExplodeAndUnique(delimiter, string) {
        const result = [];
        const items = string.split(delimiter);
        for (let i = 0; i < items.length; i++) {
            const item = items[i].trim();
            if (item.length > 0) {
                if (jQuery$1.inArray(item, result) === -1) {
                    result.push(item);
                }
            }
        }
        return result;
    }
    initialize(currentModal) {
        this.currentModal = currentModal;
        const isInIframe = (window.location !== window.parent.location);
        if (isInIframe) {
            top.require(['TYPO3/CMS/Install/chosen.jquery.min'], () => {
                this.getContent();
            });
        }
        else {
            import('../../chosen.jquery.min.esm.js').then(() => {
                this.getContent();
            });
        }
        // Mark a file as read
        currentModal.on('click', '.t3js-upgradeDocs-markRead', (e) => {
            this.markRead(e.target);
        });
        currentModal.on('click', '.t3js-upgradeDocs-unmarkRead', (e) => {
            this.unmarkRead(e.target);
        });
        // Make jquerys "contains" work case-insensitive
        jQuery.expr[':'].contains = jQuery.expr.createPseudo((arg) => {
            return (elem) => {
                return jQuery(elem).text().toUpperCase().includes(arg.toUpperCase());
            };
        });
    }
    getContent() {
        const modalContent = this.getModalBody();
        modalContent.on('show.bs.collapse', this.selectorUpgradeDoc, (e) => {
            this.renderTags(jQuery$1(e.currentTarget));
        });
        (new AjaxRequest(Router.getUrl('upgradeDocsGetContent')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                modalContent.empty().append(data.html);
                this.initializeFullTextSearch();
                this.initializeChosenSelector();
                this.loadChangelogs();
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    loadChangelogs() {
        const promises = [];
        const modalContent = this.getModalBody();
        this.findInModal(this.selectorChangeLogsForVersionContainer).each((index, el) => {
            const request = (new AjaxRequest(Router.getUrl('upgradeDocsGetChangelogForVersion')))
                .withQueryArguments({
                install: {
                    version: el.dataset.version,
                },
            })
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    const $panelGroup = jQuery$1(el);
                    const $container = $panelGroup.find(this.selectorChangeLogsForVersion);
                    $container.html(data.html);
                    this.moveNotRelevantDocuments($container);
                    // Remove loading spinner form panel
                    $panelGroup.find('.t3js-panel-loading').remove();
                }
                else {
                    NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
            promises.push(request);
        });
        Promise.all(promises).then(() => {
            this.fulltextSearchField.prop('disabled', false);
            this.appendItemsToChosenSelector();
        });
    }
    initializeFullTextSearch() {
        this.fulltextSearchField = this.findInModal(this.selectorFulltextSearch);
        const searchInput = this.fulltextSearchField.get(0);
        searchInput.clearable({
            onClear: () => {
                this.combinedFilterSearch();
            }
        });
        searchInput.focus();
        this.initializeChosenSelector();
        new DebounceEvent('keyup', () => {
            this.combinedFilterSearch();
        }).bindTo(searchInput);
    }
    initializeChosenSelector() {
        this.chosenField = this.getModalBody().find(this.selectorChosenField);
        const config = {
            '.chosen-select': { width: '100%', placeholder_text_multiple: 'tags' },
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: '100%' },
        };
        for (const selector in config) {
            if (config.hasOwnProperty(selector)) {
                this.findInModal(selector).chosen(config[selector]);
            }
        }
        this.chosenField.on('change', () => {
            this.combinedFilterSearch();
        });
    }
    /**
     * Appends tags to the chosen selector
     */
    appendItemsToChosenSelector() {
        let tagString = '';
        jQuery$1(this.findInModal(this.selectorUpgradeDoc)).each((index, element) => {
            tagString += jQuery$1(element).data('item-tags') + ',';
        });
        const tagArray = UpgradeDocs.trimExplodeAndUnique(',', tagString).sort((a, b) => {
            // Sort case-insensitive by name
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        this.chosenField.prop('disabled', false);
        jQuery$1.each(tagArray, (i, tag) => {
            this.chosenField.append(jQuery$1('<option>').text(tag));
        });
        this.chosenField.trigger('chosen:updated');
    }
    combinedFilterSearch() {
        const modalContent = this.getModalBody();
        const $items = modalContent.find('div.item');
        if (this.chosenField.val().length < 1 && this.fulltextSearchField.val().length < 1) {
            this.currentModal.find('.panel-version .panel-collapse.in').collapse('hide');
            $items.removeClass('hidden searchhit filterhit');
            return false;
        }
        $items.addClass('hidden').removeClass('searchhit filterhit');
        // apply tags
        if (this.chosenField.val().length > 0) {
            $items
                .addClass('hidden')
                .removeClass('filterhit');
            const orTags = [];
            const andTags = [];
            jQuery$1.each(this.chosenField.val(), (index, item) => {
                const tagFilter = '[data-item-tags*="' + item + '"]';
                if (item.includes(':', 1)) {
                    orTags.push(tagFilter);
                }
                else {
                    andTags.push(tagFilter);
                }
            });
            const andString = andTags.join('');
            const tags = [];
            if (orTags.length) {
                for (let orTag of orTags) {
                    tags.push(andString + orTag);
                }
            }
            else {
                tags.push(andString);
            }
            const tagSelection = tags.join(',');
            modalContent.find(tagSelection)
                .removeClass('hidden')
                .addClass('searchhit filterhit');
        }
        else {
            $items
                .addClass('filterhit')
                .removeClass('hidden');
        }
        // apply fulltext search
        const typedQuery = this.fulltextSearchField.val();
        modalContent.find('div.item.filterhit').each((index, element) => {
            const $item = jQuery$1(element);
            if (jQuery$1(':contains(' + typedQuery + ')', $item).length > 0 || jQuery$1('input[value*="' + typedQuery + '"]', $item).length > 0) {
                $item.removeClass('hidden').addClass('searchhit');
            }
            else {
                $item.removeClass('searchhit').addClass('hidden');
            }
        });
        modalContent.find('.searchhit').closest('.panel-collapse').collapse('show');
        // Check for empty panels
        modalContent.find('.panel-version').each((index, element) => {
            const $element = jQuery$1(element);
            if ($element.find('.searchhit', '.filterhit').length < 1) {
                $element.find(' > .panel-collapse').collapse('hide');
            }
        });
        return true;
    }
    renderTags($upgradeDocumentContainer) {
        const $tagContainer = $upgradeDocumentContainer.find('.t3js-tags');
        if ($tagContainer.children().length === 0) {
            const tags = $upgradeDocumentContainer.data('item-tags').split(',');
            tags.forEach((value) => {
                $tagContainer.append(jQuery$1('<span />', { 'class': 'label' }).text(value));
            });
        }
    }
    /**
     * Moves all documents that are either read or not affected
     */
    moveNotRelevantDocuments($container) {
        $container.find('[data-item-state="read"]').appendTo(this.findInModal('.panel-body-read'));
        $container.find('[data-item-state="notAffected"]').appendTo(this.findInModal('.panel-body-not-affected'));
    }
    markRead(element) {
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().data('upgrade-docs-mark-read-token');
        const $button = jQuery$1(element).closest('a');
        $button.toggleClass('t3js-upgradeDocs-unmarkRead t3js-upgradeDocs-markRead');
        $button.find('i').toggleClass('fa-check fa-ban');
        $button.closest('.panel').appendTo(this.findInModal('.panel-body-read'));
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                ignoreFile: $button.data('filepath'),
                token: executeToken,
                action: 'upgradeDocsMarkRead',
            },
        })
            .catch((error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    unmarkRead(element) {
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().data('upgrade-docs-unmark-read-token');
        const $button = jQuery$1(element).closest('a');
        const version = $button.closest('.panel').data('item-version');
        $button.toggleClass('t3js-upgradeDocs-markRead t3js-upgradeDocs-unmarkRead');
        $button.find('i').toggleClass('fa-check fa-ban');
        $button.closest('.panel').appendTo(this.findInModal('*[data-group-version="' + version + '"] .panel-body'));
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                ignoreFile: $button.data('filepath'),
                token: executeToken,
                action: 'upgradeDocsUnmarkRead',
            },
        })
            .catch((error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
}
var UpgradeDocs$1 = new UpgradeDocs();

export default UpgradeDocs$1;
