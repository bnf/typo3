import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import Popover from './Popover.esm.js';

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
 * Module: TYPO3/CMS/Backend/ContextHelp
 * API for context help.
 * @exports TYPO3/CMS/Backend/ContextHelp
 */
class ContextHelp {
    constructor() {
        this.ajaxUrl = TYPO3.settings.ajaxUrls.context_help;
        this.trigger = 'click';
        this.placement = 'auto';
        this.selector = '.help-link';
        this.initialize();
    }
    /**
     * @return {Window}
     */
    static resolveBackend() {
        if (typeof window.opener !== 'undefined' && window.opener !== null) {
            return window.opener.top;
        }
        else {
            return top;
        }
    }
    initialize() {
        const backendWindow = ContextHelp.resolveBackend();
        if (typeof backendWindow.TYPO3.settings.ContextHelp !== 'undefined') {
            this.helpModuleUrl = backendWindow.TYPO3.settings.ContextHelp.moduleUrl;
        }
        if (typeof TYPO3.ShortcutMenu === 'undefined' && typeof backendWindow.TYPO3.ShortcutMenu === 'undefined') {
            // @FIXME: if we are in the popup... remove the bookmark / shortcut button
            // @TODO: make it possible to use the bookmark button also in popup mode
            $('.icon-actions-system-shortcut-new').closest('.btn').hide();
        }
        let title = '&nbsp;';
        if (typeof backendWindow.TYPO3.lang !== 'undefined') {
            title = backendWindow.TYPO3.lang.csh_tooltip_loading;
        }
        const $element = $(this.selector);
        $element
            .attr('data-loaded', 'false')
            .attr('data-html', 'true')
            .attr('data-original-title', title)
            .attr('data-placement', this.placement)
            .attr('data-trigger', this.trigger);
        Popover.popover($element);
        $(document).on('show.bs.popover', this.selector, (e) => {
            const $me = $(e.currentTarget);
            const description = $me.data('description');
            if (typeof description !== 'undefined' && description !== '') {
                Popover.setOptions($me, {
                    title: $me.data('title'),
                    content: description,
                });
            }
            else if ($me.attr('data-loaded') === 'false' && $me.data('table')) {
                this.loadHelp($me);
            }
            // if help icon is in DocHeader, force open to bottom
            if ($me.closest('.t3js-module-docheader').length) {
                Popover.setOption($me, 'placement', 'bottom');
            }
        }).on('shown.bs.popover', this.selector, (e) => {
            const $popover = $(e.target).data('bs.popover').$tip;
            if (!$popover.find('.popover-title').is(':visible')) {
                $popover.addClass('no-title');
            }
        }).on('click', '.help-has-link', (e) => {
            $('.popover').each((index, popover) => {
                const $popover = $(popover);
                if ($popover.has(e.target).length) {
                    this.showHelpPopup($popover.data('bs.popover').$element);
                }
            });
        }).on('click', 'body', (e) => {
            $(this.selector).each((index, triggerElement) => {
                const $triggerElement = $(triggerElement);
                // the 'is' for buttons that trigger popups
                // the 'has' for icons within a button that triggers a popup
                if (!$triggerElement.is(e.target)
                    && $triggerElement.has(e.target).length === 0
                    && $('.popover').has(e.target).length === 0) {
                    Popover.hide($triggerElement);
                }
            });
        });
    }
    /**
     * Open the help popup
     *
     * @param {JQuery} $trigger
     */
    showHelpPopup($trigger) {
        try {
            const cshWindow = window.open(this.helpModuleUrl +
                '&table=' + $trigger.data('table') +
                '&field=' + $trigger.data('field') +
                '&action=detail', 'ContextHelpWindow', 'height=400,width=600,status=0,menubar=0,scrollbars=1');
            cshWindow.focus();
            Popover.hide($trigger);
            return cshWindow;
        }
        catch (_a) {
            // do nothing
        }
    }
    /**
     * Load help data
     *
     * @param {JQuery} $trigger
     */
    loadHelp($trigger) {
        const table = $trigger.data('table');
        const field = $trigger.data('field');
        // If a table is defined, use ajax call to get the tooltip's content
        if (table) {
            // Load content
            new AjaxRequest(this.ajaxUrl).withQueryArguments({
                params: {
                    action: 'getContextHelp',
                    table: table,
                    field: field,
                }
            }).get().then(async (response) => {
                const data = await response.resolve();
                const title = data.title || '';
                const content = data.content || '<p></p>';
                Popover.setOptions($trigger, {
                    title: title,
                    content: content,
                });
                $trigger
                    .attr('data-loaded', 'true')
                    .one('hidden.bs.popover', () => {
                    Popover.show($trigger);
                });
                Popover.hide($trigger);
            });
        }
    }
}
var ContextHelp$1 = new ContextHelp();

export default ContextHelp$1;
