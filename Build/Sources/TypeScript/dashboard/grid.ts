// @ts-strict-ignore
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

import Muuri, { type GridOptions, type Item } from 'muuri';
import type { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';

class Grid {
  private readonly selector: string = '.dashboard-grid';

  constructor() {
    this.initialize();
  }

  public initialize(): void {
    const options: GridOptions = {
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
        createElement: (item: Item): HTMLElement => {
          return item.getElement().cloneNode(true) as HTMLElement;
        }
      },
      dragSortPredicate: {
        action:'move',
        threshold: 30
      },
      dragHandle: '.js-dashboard-move-widget',
      dragRelease: {
        duration: 400,
        easing: 'ease',
      },
      layout: {
        fillGaps: false,
        rounding: false,
      }
    };

    if (document.querySelector(this.selector) !== null) {
      const dashboard = new Muuri(this.selector, options);
      dashboard.on('dragStart', (): void => {
        document.querySelectorAll('.dashboard-item').forEach((dashboardItem: HTMLDivElement): void => {
          dashboardItem.classList.remove('dashboard-item--enableSelect');
        });
      });
      dashboard.on('dragReleaseEnd', (): void => {
        document.querySelectorAll('.dashboard-item').forEach((dashboardItem: HTMLDivElement): void => {
          dashboardItem.classList.add('dashboard-item--enableSelect');
        });
        this.saveItems(dashboard);
      });

      new RegularEvent('widgetContentRendered', (): void => {
        dashboard.refreshItems().layout();
      }).delegateTo(document, '.dashboard-item');
    }
  }

  public saveItems(dashboard: any): void {
    const widgets = dashboard.getItems().map(function (item: any) {
      return [
        item.getElement().getAttribute('data-widget-key'),
        item.getElement().getAttribute('data-widget-hash')
      ];
    });

    (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_save_widget_positions)).post({
      widgets: widgets
    }).then(async (response: AjaxResponse): Promise<void> => {
      await response.resolve();
    });
  }
}

export default new Grid();
