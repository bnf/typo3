define(['../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../core/Resources/Public/JavaScript/Contrib/muuri'], function (AjaxRequest, RegularEvent, muuri) { 'use strict';

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
    class Grid {
        constructor() {
            this.selector = '.dashboard-grid';
            this.initialize();
        }
        initialize() {
            const options = {
                dragEnabled: true,
                dragSortHeuristics: {
                    sortInterval: 50,
                    minDragDistance: 10,
                    minBounceBackAngle: 1
                },
                layoutDuration: 400,
                layoutEasing: 'ease',
                dragPlaceholder: {
                    enabled: true,
                    duration: 400,
                    createElement: (item) => {
                        return item.getElement().cloneNode(true);
                    }
                },
                dragSortPredicate: {
                    action: 'move',
                    threshold: 30
                },
                dragStartPredicate: {
                    handle: '.js-dashboard-move-widget'
                },
                dragReleaseDuration: 400,
                dragReleaseEasing: 'ease',
                layout: {
                    fillGaps: false,
                    rounding: false,
                }
            };
            if (document.querySelector(this.selector) !== null) {
                const dashboard = new muuri(this.selector, options);
                dashboard.on('dragStart', () => {
                    document.querySelectorAll('.dashboard-item').forEach((dashboardItem) => {
                        dashboardItem.classList.remove('dashboard-item--enableSelect');
                    });
                });
                dashboard.on('dragReleaseEnd', () => {
                    document.querySelectorAll('.dashboard-item').forEach((dashboardItem) => {
                        dashboardItem.classList.add('dashboard-item--enableSelect');
                    });
                    this.saveItems(dashboard);
                });
                new RegularEvent('widgetContentRendered', () => {
                    dashboard.refreshItems().layout();
                }).delegateTo(document, '.dashboard-item');
            }
        }
        saveItems(dashboard) {
            let widgets = dashboard.getItems().map(function (item) {
                return [
                    item.getElement().getAttribute('data-widget-key'),
                    item.getElement().getAttribute('data-widget-hash')
                ];
            });
            (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_save_widget_positions)).post({
                widgets: widgets
            }).then(async (response) => {
                await response.resolve();
            });
        }
    }
    var Grid$1 = new Grid();

    return Grid$1;

});
