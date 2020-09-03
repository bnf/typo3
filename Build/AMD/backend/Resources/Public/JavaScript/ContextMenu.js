define(['require', '../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent', './ContextMenuActions'], function (require, jquery, AjaxRequest, ThrottleEvent, ContextMenuActions) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) { return e; } else {
            var n = Object.create(null);
            if (e) {
                Object.keys(e).forEach(function (k) {
                    if (k !== 'default') {
                        var d = Object.getOwnPropertyDescriptor(e, k);
                        Object.defineProperty(n, k, d.get ? d : {
                            enumerable: true,
                            get: function () {
                                return e[k];
                            }
                        });
                    }
                });
            }
            n['default'] = e;
            return Object.freeze(n);
        }
    }

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
            this.delayContextMenuHide = false;
            this.record = { uid: null, table: null };
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
            this.initializeEvents();
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
            return '<a class="list-group-item"'
                + ' data-callback-action="' + item.callbackAction + '"'
                + attributesString + '><span class="list-group-item-icon">' + item.icon + '</span> ' + item.label + '</a>';
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
            if (jquery('#contentMenu0').length === 0) {
                const code = '<div id="contentMenu0" class="context-menu"></div>'
                    + '<div id="contentMenu1" class="context-menu" style="display: block;"></div>';
                jquery('body').append(code);
            }
        }
        initializeEvents() {
            jquery(document).on('click contextmenu', '.t3js-contextmenutrigger', (e) => {
                const $me = jquery(e.currentTarget);
                // if there is an other "inline" onclick setting, context menu is not triggered
                // usually this is the case for the foldertree
                if ($me.prop('onclick') && e.type === 'click') {
                    return;
                }
                e.preventDefault();
                this.show($me.data('table'), $me.data('uid'), $me.data('context'), $me.data('iteminfo'), $me.data('parameters'));
            });
            // register mouse movement inside the document
            new ThrottleEvent('mousemove', this.storeMousePositionEvent.bind(this), 50).bindTo(document);
        }
        /**
         * Main function, called from most context menu links
         *
         * @param {string} table Table from where info should be fetched
         * @param {number} uid The UID of the item
         * @param {string} context Context of the item
         * @param {string} enDisItems Items to disable / enable
         * @param {string} addParams Additional params
         */
        show(table, uid, context, enDisItems, addParams) {
            this.record = { table: table, uid: uid };
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
            let url = TYPO3.settings.ajaxUrls.contextmenu;
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
         * @param {Array<MenuItem>} items The data that will be put in the menu
         * @param {number} level The depth of the context menu
         */
        populateData(items, level) {
            ContextMenu.initializeContextMenuContainer();
            const $obj = jquery('#contentMenu' + level);
            if ($obj.length && (level === 0 || jquery('#contentMenu' + (level - 1)).is(':visible'))) {
                const elements = this.drawMenu(items, level);
                $obj.html('<div class="list-group">' + elements + '</div>');
                jquery('a.list-group-item', $obj).on('click', (event) => {
                    event.preventDefault();
                    const $me = jquery(event.currentTarget);
                    if ($me.hasClass('list-group-item-submenu')) {
                        this.openSubmenu(level, $me);
                        return;
                    }
                    const callbackName = $me.data('callback-action');
                    const callbackModule = $me.data('callback-module');
                    if ($me.data('callback-module')) {
                        new Promise(function (resolve, reject) { require([callbackModule], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject) }).then(({ default: callbackModuleCallback }) => {
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
                $obj.css(this.getPosition($obj)).show();
            }
        }
        /**
         * @param {number} level
         * @param {JQuery} $item
         */
        openSubmenu(level, $item) {
            const $obj = jquery('#contentMenu' + (level + 1)).html('');
            $item.next().find('.list-group').clone(true).appendTo($obj);
            $obj.css(this.getPosition($obj)).show();
        }
        getPosition($obj) {
            let x = this.mousePos.X;
            let y = this.mousePos.Y;
            const dimsWindow = {
                width: jquery(window).width() - 20,
                height: jquery(window).height(),
            };
            // dimensions for the context menu
            const dims = {
                width: $obj.width(),
                height: $obj.height(),
            };
            const relative = {
                X: this.mousePos.X - jquery(document).scrollLeft(),
                Y: this.mousePos.Y - jquery(document).scrollTop(),
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
                else if ((dimsWindow.width - dims.width - relative.X) < jquery(document).scrollLeft()) {
                    x = jquery(document).scrollLeft();
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
            for (let item of Object.values(items)) {
                if (item.type === 'item') {
                    elements += ContextMenu.drawActionItem(item);
                }
                else if (item.type === 'divider') {
                    elements += '<a class="list-group-item list-group-item-divider"></a>';
                }
                else if (item.type === 'submenu' || item.childItems) {
                    elements += '<a class="list-group-item list-group-item-submenu">'
                        + '<span class="list-group-item-icon">' + item.icon + '</span> '
                        + item.label + '&nbsp;&nbsp;<span class="fa fa-caret-right"></span>'
                        + '</a>';
                    const childElements = this.drawMenu(item.childItems, 1);
                    elements += '<div class="context-menu contentMenu' + (level + 1) + '" style="display:none;">'
                        + '<div class="list-group">' + childElements + '</div>'
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
            const $element = jquery(obj);
            if ($element.length > 0 && $element.is(':visible') && !ContextMenu.within($element, this.mousePos.X, this.mousePos.Y)) {
                this.hide(obj);
            }
            else if ($element.length > 0 && $element.is(':visible')) {
                this.delayContextMenuHide = true;
            }
        }
        /**
         * @param {string} obj
         */
        hide(obj) {
            this.delayContextMenuHide = false;
            window.setTimeout(() => {
                if (!this.delayContextMenuHide) {
                    jquery(obj).hide();
                }
            }, 500);
        }
        /**
         * Hides all context menus
         */
        hideAll() {
            this.hide('#contentMenu0');
            this.hide('#contentMenu1');
        }
    }
    var ContextMenu$1 = new ContextMenu();

    return ContextMenu$1;

});
