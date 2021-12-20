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

import ContentContainer = require('TYPO3/CMS/Backend/Viewport/ContentContainer');
import ConsumerScope = require('TYPO3/CMS/Backend/Event/ConsumerScope');
import Loader = require('TYPO3/CMS/Backend/Viewport/Loader');
import NavigationContainer = require('TYPO3/CMS/Backend/Viewport/NavigationContainer');
import Topbar = require('TYPO3/CMS/Backend/Viewport/Topbar');

class Viewport {
  // The attributes are uppercase for compatibility reasons
  public readonly Loader: Loader = Loader;
  public readonly Topbar: Topbar;
  public readonly NavigationContainer: NavigationContainer = null;
  public readonly ContentContainer: ContentContainer = null;
  public readonly consumerScope: any = ConsumerScope;

  constructor() {
    this.Topbar = new Topbar();
    this.NavigationContainer = new NavigationContainer(this.consumerScope);
    this.ContentContainer = new ContentContainer(this.consumerScope);
  }
}

let viewportObject: Viewport;

if (!top.TYPO3.Backend) {
  viewportObject = new Viewport();
  top.TYPO3.Backend = viewportObject;
} else {
  viewportObject = top.TYPO3.Backend;
}

export = viewportObject;
