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

import $ from 'jquery';
import ContentContainer from './Viewport/ContentContainer';
import ConsumerScope from './Event/ConsumerScope';
import Loader from './Viewport/Loader';
import NavigationContainer from './Viewport/NavigationContainer';
import Topbar from './Viewport/Topbar';
import ThrottleEvent from 'TYPO3/CMS/Core/Event/ThrottleEvent';

class Viewport {
  // The attributes are uppercase for compatibility reasons
  public readonly Loader: Loader = Loader;
  public readonly Topbar: Topbar;
  public readonly NavigationContainer: NavigationContainer = null;
  public readonly ContentContainer: ContentContainer = null;
  public readonly consumerScope: any = ConsumerScope;

  constructor() {
    $((): void => this.initialize());
    this.Topbar = new Topbar();
    this.NavigationContainer = new NavigationContainer(this.consumerScope);
    this.ContentContainer = new ContentContainer(this.consumerScope);
  }

  public doLayout(): void {
    this.NavigationContainer.cleanup();
    this.NavigationContainer.calculateScrollbar();
    $('.t3js-topbar-header').css('padding-right', $('.t3js-scaffold-toolbar').outerWidth());
  }

  private initialize(): void {
    this.doLayout();
    new ThrottleEvent('resize', () => {
      this.doLayout();
    }, 100).bindTo(window);
  }
}

let viewportObject: Viewport;

if (!top.TYPO3.Backend) {
  viewportObject = new Viewport();
  top.TYPO3.Backend = viewportObject;
} else {
  viewportObject = top.TYPO3.Backend;
}

export default viewportObject;
