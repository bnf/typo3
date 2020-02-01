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

import * as $ from 'jquery';
import ModuleMenu = require('TYPO3/CMS/Backend/ModuleMenu');

class DashboardToolbarItem {
  private selector: string = '.toolbar-item-dashboard-link';

  constructor() {
    $((): void => {
      this.initialize();
    });
  }

  public initialize(): void {
    $(document).on('click', this.selector, (e: JQueryEventObject): void => {
      ModuleMenu.App.showModule('dashboard_dashboard')
    });
  }
}

export = new DashboardToolbarItem();
