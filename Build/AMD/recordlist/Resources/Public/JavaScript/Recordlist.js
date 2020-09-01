define(['jquery', '../../../../backend/Resources/Public/JavaScript/Icons', '../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../backend/Resources/Public/JavaScript/Viewport', '../../../../backend/Resources/Public/JavaScript/Storage/Persistent'], function ($, Icons, RegularEvent, Viewport, Persistent) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
     * Module: TYPO3/CMS/Recordlist/Recordlist
     * Usability improvements for the record list
     * @exports TYPO3/CMS/Recordlist/Recordlist
     */
    class Recordlist {
        constructor() {
            this.identifier = {
                entity: '.t3js-entity',
                toggle: '.t3js-toggle-recordlist',
                localize: '.t3js-action-localize',
                icons: {
                    collapse: 'actions-view-list-collapse',
                    expand: 'actions-view-list-expand',
                    editMultiple: '.t3js-record-edit-multiple',
                },
            };
            this.toggleClick = (e) => {
                e.preventDefault();
                const $me = $__default['default'](e.currentTarget);
                const table = $me.data('table');
                const $target = $__default['default']($me.data('target'));
                const isExpanded = $target.data('state') === 'expanded';
                const $collapseIcon = $me.find('.collapseIcon');
                const toggleIcon = isExpanded ? this.identifier.icons.expand : this.identifier.icons.collapse;
                Icons.getIcon(toggleIcon, Icons.sizes.small).done((icon) => {
                    $collapseIcon.html(icon);
                });
                // Store collapse state in UC
                let storedModuleDataList = {};
                if (Persistent.isset('moduleData.list')) {
                    storedModuleDataList = Persistent.get('moduleData.list');
                }
                const collapseConfig = {};
                collapseConfig[table] = isExpanded ? 1 : 0;
                $__default['default'].extend(true, storedModuleDataList, collapseConfig);
                Persistent.set('moduleData.list', storedModuleDataList).done(() => {
                    $target.data('state', isExpanded ? 'collapsed' : 'expanded');
                });
            };
            /**
             * Handles editing multiple records.
             */
            this.onEditMultiple = (event) => {
                event.preventDefault();
                let $tableContainer;
                let tableName;
                let entityIdentifiers;
                let uri;
                let patterns;
                $tableContainer = $__default['default'](event.currentTarget).closest('[data-table]');
                if ($tableContainer.length === 0) {
                    return;
                }
                uri = $__default['default'](event.currentTarget).data('uri');
                tableName = $tableContainer.data('table');
                entityIdentifiers = $tableContainer
                    .find(this.identifier.entity + '[data-uid][data-table="' + tableName + '"]')
                    .map((index, entity) => {
                    return $__default['default'](entity).data('uid');
                })
                    .toArray()
                    .join(',');
                patterns = uri.match(/{[^}]+}/g);
                $__default['default'].each(patterns, (patternIndex, pattern) => {
                    const expression = pattern.substr(1, pattern.length - 2);
                    const pipes = expression.split(':');
                    const name = pipes.shift();
                    let value;
                    switch (name) {
                        case 'entityIdentifiers':
                            value = entityIdentifiers;
                            break;
                        case 'T3_THIS_LOCATION':
                            value = T3_THIS_LOCATION;
                            break;
                        default:
                            return;
                    }
                    $__default['default'].each(pipes, (pipeIndex, pipe) => {
                        if (pipe === 'editList') {
                            value = this.editList(tableName, value);
                        }
                    });
                    uri = uri.replace(pattern, value);
                });
                window.location.href = uri;
            };
            this.disableButton = (event) => {
                const $me = $__default['default'](event.currentTarget);
                $me.prop('disable', true).addClass('disabled');
            };
            this.deleteRow = (payload) => {
                const $tableElement = $__default['default'](`table[data-table="${payload.table}"]`);
                const $rowElement = $tableElement.find(`tr[data-uid="${payload.uid}"]`);
                const $panel = $tableElement.closest('.panel');
                const $panelHeading = $panel.find('.panel-heading');
                const $translatedRowElements = $tableElement.find(`[data-l10nparent="${payload.uid}"]`);
                const $rowElements = $__default['default']().add($rowElement).add($translatedRowElements);
                $rowElements.fadeTo('slow', 0.4, () => {
                    $rowElements.slideUp('slow', () => {
                        $rowElements.remove();
                        if ($tableElement.find('tbody tr').length === 0) {
                            $panel.slideUp('slow');
                        }
                    });
                });
                if ($rowElement.data('l10nparent') === '0' || $rowElement.data('l10nparent') === '') {
                    const count = Number($panelHeading.find('.t3js-table-total-items').html());
                    $panelHeading.find('.t3js-table-total-items').text(count - 1);
                }
                if (payload.table === 'pages') {
                    Viewport.NavigationContainer.PageTree.refreshTree();
                }
            };
            $__default['default'](document).on('click', this.identifier.toggle, this.toggleClick);
            $__default['default'](document).on('click', this.identifier.icons.editMultiple, this.onEditMultiple);
            $__default['default'](document).on('click', this.identifier.localize, this.disableButton);
            new RegularEvent('typo3:datahandler:process', this.handleDataHandlerResult.bind(this)).bindTo(document);
        }
        editList(table, idList) {
            const list = [];
            let pointer = 0;
            let pos = idList.indexOf(',');
            while (pos !== -1) {
                if (this.getCheckboxState(table + '|' + idList.substr(pointer, pos - pointer))) {
                    list.push(idList.substr(pointer, pos - pointer));
                }
                pointer = pos + 1;
                pos = idList.indexOf(',', pointer);
            }
            if (this.getCheckboxState(table + '|' + idList.substr(pointer))) {
                list.push(idList.substr(pointer));
            }
            return list.length > 0 ? list.join(',') : idList;
        }
        handleDataHandlerResult(e) {
            const payload = e.detail.payload;
            if (payload.hasErrors) {
                return;
            }
            if (payload.component === 'datahandler') {
                // In this case the delete action was triggered by AjaxDataHandler itself, which currently has its own handling.
                // Visual handling is about to get decoupled from data handling itself, thus the logic is duplicated for now.
                return;
            }
            if (payload.action === 'delete') {
                this.deleteRow(payload);
            }
        }
        ;
        getCheckboxState(CBname) {
            const fullName = 'CBC[' + CBname + ']';
            const checkbox = document.querySelector('form[name="dblistForm"] [name="' + fullName + '"]');
            return checkbox.checked;
        }
    }
    var Recordlist$1 = new Recordlist();

    return Recordlist$1;

});
