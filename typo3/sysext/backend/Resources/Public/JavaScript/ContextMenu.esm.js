import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import ContextMenuActions from './ContextMenuActions.esm.js';
import ThrottleEvent from '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.esm.js';

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
 * Module: TYPO3/CMS/Backend/ContextMenu
 * Container used to load the context menu via AJAX to render the result in a layer next to the mouse cursor
 */
class ContextMenu {
    constructor() {
        this.mousePos = { X: null, Y: null };
        /**
         * If this.delayContextMenuHide is set to true, any parent context menu will stay visibile even if the cursor is out
         * of its boundaries.
         */
        this.delayContextMenuHide = false;
        this.record = { uid: null, table: null };
        this.eventSources = [];
        this.closeMenuTimeout = {};
        /**
         * event handler function that saves the
         * actual position of the mouse
         * in the context menu object
         *
         * @param {JQueryEventObject} event The event object
         */
        this.storeMousePositionEvent = (event) => {
            this.mousePos = { X: event.pageX, Y: event.pageY };
            this.mouseOutFromMenu('#contentMenu0');
            this.mouseOutFromMenu('#contentMenu1');
        };
        jQuery(document).on('click contextmenu', '.t3js-contextmenutrigger', (e) => {
            const $me = jQuery(e.currentTarget);
            // if there is an other "inline" onclick setting, context menu is not triggered
            // usually this is the case for the foldertree
            if ($me.prop('onclick') && e.type === 'click') {
                return;
            }
            e.preventDefault();
            this.show($me.data('table'), $me.data('uid'), $me.data('context'), $me.data('iteminfo'), $me.data('parameters'), e.target);
        });
        // register mouse movement inside the document
        new ThrottleEvent('mousemove', this.storeMousePositionEvent.bind(this), 50).bindTo(document);
    }
    /**
     * @param {MenuItem} item
     * @returns {string}
     */
    static drawActionItem(item) {
        const attributes = item.additionalAttributes || {};
        let attributesString = '';
        for (const attribute of Object.entries(attributes)) {
            const [k, v] = attribute;
            attributesString += ' ' + k + '="' + v + '"';
        }
        return '<li role="menuitem" class="list-group-item" tabindex="-1"'
            + ' data-callback-action="' + item.callbackAction + '"'
            + attributesString + '><span class="list-group-item-icon">' + item.icon + '</span> ' + item.label + '</li>';
    }
    /**
     * @param {JQuery} $element
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    static within($element, x, y) {
        const offset = $element.offset();
        return (y >= offset.top &&
            y < offset.top + $element.height() &&
            x >= offset.left &&
            x < offset.left + $element.width());
    }
    /**
     * Manipulates the DOM to add the divs needed for context menu the bottom of the <body>-tag
     */
    static initializeContextMenuContainer() {
        if (jQuery('#contentMenu0').length === 0) {
            const code = '<div id="contentMenu0" class="context-menu" style="display: none;"></div>'
                + '<div id="contentMenu1" class="context-menu" style="display: none;"></div>';
            jQuery('body').append(code);
        }
    }
    /**
     * Main function, called from most context menu links
     *
     * @param {string} table Table from where info should be fetched
     * @param {number} uid The UID of the item
     * @param {string} context Context of the item
     * @param {string} enDisItems Items to disable / enable
     * @param {string} addParams Additional params
     * @param {Element} eventSource Source Element
     */
    show(table, uid, context, enDisItems, addParams, eventSource = null) {
        this.hideAll();
        this.closeMenuTimeout = {};
        this.record = { table: table, uid: uid };
        // fix: [tabindex=-1] is not focusable!!!
        const focusableSource = eventSource.matches('a, button, [tabindex]') ? eventSource : eventSource.closest('a, button, [tabindex]');
        this.eventSources.push(focusableSource);
        let parameters = '';
        if (typeof table !== 'undefined') {
            parameters += 'table=' + encodeURIComponent(table);
        }
        if (typeof uid !== 'undefined') {
            parameters += (parameters.length > 0 ? '&' : '') + 'uid=' + uid;
        }
        if (typeof context !== 'undefined') {
            parameters += (parameters.length > 0 ? '&' : '') + 'context=' + context;
        }
        if (typeof enDisItems !== 'undefined') {
            parameters += (parameters.length > 0 ? '&' : '') + 'enDisItems=' + enDisItems;
        }
        if (typeof addParams !== 'undefined') {
            parameters += (parameters.length > 0 ? '&' : '') + 'addParams=' + addParams;
        }
        this.fetch(parameters);
    }
    /**
     * Make the AJAX request
     *
     * @param {string} parameters Parameters sent to the server
     */
    fetch(parameters) {
        const url = TYPO3.settings.ajaxUrls.contextmenu;
        (new AjaxRequest(url)).withQueryArguments(parameters).get().then(async (response) => {
            const data = await response.resolve();
            if (typeof response !== 'undefined' && Object.keys(response).length > 0) {
                this.populateData(data, 0);
            }
        });
    }
    /**
     * Fills the context menu with content and displays it correctly
     * depending on the mouse position
     *
     * @param {MenuItems} items The data that will be put in the menu
     * @param {number} level The depth of the context menu
     */
    populateData(items, level) {
        ContextMenu.initializeContextMenuContainer();
        const $obj = jQuery('#contentMenu' + level);
        if ($obj.length && (level === 0 || jQuery('#contentMenu' + (level - 1)).is(':visible'))) {
            const elements = this.drawMenu(items, level);
            $obj.html('<ul class="list-group">' + elements + '</ul>');
            jQuery('li.list-group-item', $obj).on('click', (event) => {
                event.preventDefault();
                const $me = jQuery(event.currentTarget);
                if ($me.hasClass('list-group-item-submenu')) {
                    this.openSubmenu(level, $me, false);
                    return;
                }
                const callbackName = $me.data('callback-action');
                const callbackModule = $me.data('callback-module');
                if ($me.data('callback-module')) {
                    import(callbackModule).then(({ default: callbackModuleCallback }) => {
                        callbackModuleCallback[callbackName].bind($me)(this.record.table, this.record.uid);
                    });
                }
                else if (ContextMenuActions && typeof ContextMenuActions[callbackName] === 'function') {
                    ContextMenuActions[callbackName].bind($me)(this.record.table, this.record.uid);
                }
                else {
                    console.log('action: ' + callbackName + ' not found');
                }
                this.hideAll();
            });
            jQuery('li.list-group-item', $obj).on('keydown', (event) => {
                const $currentItem = jQuery(event.currentTarget);
                switch (event.key) {
                    case 'Down': // IE/Edge specific value
                    case 'ArrowDown':
                        this.setFocusToNextItem($currentItem.get(0));
                        break;
                    case 'Up': // IE/Edge specific value
                    case 'ArrowUp':
                        this.setFocusToPreviousItem($currentItem.get(0));
                        break;
                    case 'Right': // IE/Edge specific value
                    case 'ArrowRight':
                        if ($currentItem.hasClass('list-group-item-submenu')) {
                            this.openSubmenu(level, $currentItem, true);
                        }
                        else {
                            return; // allow default behaviour of right key
                        }
                        break;
                    case 'Home':
                        this.setFocusToFirstItem($currentItem.get(0));
                        break;
                    case 'End':
                        this.setFocusToLastItem($currentItem.get(0));
                        break;
                    case 'Enter':
                    case 'Space':
                        $currentItem.click();
                        break;
                    case 'Esc': // IE/Edge specific value
                    case 'Escape':
                    case 'Left': // IE/Edge specific value
                    case 'ArrowLeft':
                        this.hide('#' + $currentItem.parents('.context-menu').first().attr('id'));
                        break;
                    case 'Tab':
                        this.hideAll();
                        break;
                    default:
                        return; // return to allow default keypress behaviour
                }
                // if not returned yet, prevent the default action of the event.
                event.preventDefault();
            });
            $obj.css(this.getPosition($obj, false)).show();
            // focus the first element on creation to enable keyboard shortcuts
            jQuery('li.list-group-item[tabindex=-1]', $obj).first().focus();
        }
    }
    setFocusToPreviousItem(currentItem) {
        let previousItem = this.getItemBackward(currentItem.previousElementSibling);
        if (!previousItem) {
            previousItem = this.getLastItem(currentItem);
        }
        previousItem.focus();
    }
    setFocusToNextItem(currentItem) {
        let nextItem = this.getItemForward(currentItem.nextElementSibling);
        if (!nextItem) {
            nextItem = this.getFirstItem(currentItem);
        }
        nextItem.focus();
    }
    setFocusToFirstItem(currentItem) {
        let firstItem = this.getFirstItem(currentItem);
        if (firstItem) {
            firstItem.focus();
        }
    }
    setFocusToLastItem(currentItem) {
        let lastItem = this.getLastItem(currentItem);
        if (lastItem) {
            lastItem.focus();
        }
    }
    /**
     * Returns passed element if it is a menu item, if not checks the previous elements until one is found.
     */
    getItemBackward(element) {
        while (element &&
            (!element.classList.contains('list-group-item') || (element.getAttribute('tabindex') !== '-1'))) {
            element = element.previousElementSibling;
        }
        return element;
    }
    /**
     * Returns passed element if it is a menu item, if not checks the previous elements until one is found.
     */
    getItemForward(item) {
        while (item &&
            (!item.classList.contains('list-group-item') || (item.getAttribute('tabindex') !== '-1'))) {
            item = item.nextElementSibling;
        }
        return item;
    }
    getFirstItem(item) {
        return this.getItemForward(item.parentElement.firstElementChild);
    }
    getLastItem(item) {
        return this.getItemBackward(item.parentElement.lastElementChild);
    }
    /**
     * @param {number} level
     * @param {JQuery} $item
     * @param {boolean} keyboard
     */
    openSubmenu(level, $item, keyboard) {
        this.eventSources.push($item[0]);
        const $obj = jQuery('#contentMenu' + (level + 1)).html('');
        $item.next().find('.list-group').clone(true).appendTo($obj);
        $obj.css(this.getPosition($obj, keyboard)).show();
        jQuery('.list-group-item[tabindex=-1]', $obj).first().focus();
    }
    getPosition($obj, keyboard) {
        let x = 0, y = 0;
        if (this.eventSources.length && (this.mousePos.X === null || keyboard)) {
            const boundingRect = this.eventSources[this.eventSources.length - 1].getBoundingClientRect();
            x = this.eventSources.length > 1 ? boundingRect.right : boundingRect.x;
            y = boundingRect.y;
        }
        else {
            x = this.mousePos.X;
            y = this.mousePos.Y;
        }
        const dimsWindow = {
            width: jQuery(window).width() - 20,
            height: jQuery(window).height(),
        };
        // dimensions for the context menu
        const dims = {
            width: $obj.width(),
            height: $obj.height(),
        };
        const relative = {
            X: x - jQuery(document).scrollLeft(),
            Y: y - jQuery(document).scrollTop(),
        };
        // adjusting the Y position of the layer to fit it into the window frame
        // if there is enough space above then put it upwards,
        // otherwise adjust it to the bottom of the window
        if (dimsWindow.height - dims.height < relative.Y) {
            if (relative.Y > dims.height) {
                y -= (dims.height - 10);
            }
            else {
                y += (dimsWindow.height - dims.height - relative.Y);
            }
        }
        // adjusting the X position like Y above, but align it to the left side of the viewport if it does not fit completely
        if (dimsWindow.width - dims.width < relative.X) {
            if (relative.X > dims.width) {
                x -= (dims.width - 10);
            }
            else if ((dimsWindow.width - dims.width - relative.X) < jQuery(document).scrollLeft()) {
                x = jQuery(document).scrollLeft();
            }
            else {
                x += (dimsWindow.width - dims.width - relative.X);
            }
        }
        return { left: x + 'px', top: y + 'px' };
    }
    /**
     * fills the context menu with content and displays it correctly
     * depending on the mouse position
     *
     * @param {MenuItems} items The data that will be put in the menu
     * @param {Number} level The depth of the context menu
     * @return {string}
     */
    drawMenu(items, level) {
        let elements = '';
        for (const item of Object.values(items)) {
            if (item.type === 'item') {
                elements += ContextMenu.drawActionItem(item);
            }
            else if (item.type === 'divider') {
                elements += '<li role="separator" class="list-group-item list-group-item-divider"></li>';
            }
            else if (item.type === 'submenu' || item.childItems) {
                elements += '<li role="menuitem" aria-haspopup="true" class="list-group-item list-group-item-submenu" tabindex="-1">'
                    + '<span class="list-group-item-icon">' + item.icon + '</span> '
                    + item.label + '&nbsp;&nbsp;<span class="fa fa-caret-right"></span>'
                    + '</li>';
                const childElements = this.drawMenu(item.childItems, 1);
                elements += '<div class="context-menu contentMenu' + (level + 1) + '" style="display:none;">'
                    + '<ul role="menu" class="list-group">' + childElements + '</ul>'
                    + '</div>';
            }
        }
        return elements;
    }
    /**
     * hides a visible menu if the mouse has moved outside
     * of the object
     *
     * @param {string} obj The identifier of the object to hide
     */
    mouseOutFromMenu(obj) {
        const $element = jQuery(obj);
        if ($element.length > 0 && $element.is(':visible') && !ContextMenu.within($element, this.mousePos.X, this.mousePos.Y)) {
            this.hide(obj);
        }
        else if ($element.length > 0 && $element.is(':visible')) {
            this.delayContextMenuHide = true;
            window.clearTimeout(this.closeMenuTimeout[obj]);
        }
    }
    /**
     * @param {string} obj
     * @param {boolean} withDelay
     */
    hide(obj, withDelay = true) {
        this.delayContextMenuHide = false;
        window.clearTimeout(this.closeMenuTimeout[obj]);
        const delayHandler = () => {
            if (!this.delayContextMenuHide) {
                jQuery(obj).hide();
                const source = this.eventSources.pop();
                if (source) {
                    jQuery(source).focus();
                }
            }
        };
        if (withDelay) {
            this.closeMenuTimeout[obj] = window.setTimeout(delayHandler, 500);
        }
        else {
            delayHandler();
        }
    }
    /**
     * Hides all context menus
     */
    hideAll() {
        this.hide('#contentMenu0', false);
        this.hide('#contentMenu1', false);
    }
}
var ContextMenu$1 = new ContextMenu();

export default ContextMenu$1;
