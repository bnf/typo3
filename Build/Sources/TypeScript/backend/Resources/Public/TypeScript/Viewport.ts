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

import ContentContainer = require('./Viewport/ContentContainer');
import {ScaffoldIdentifierEnum} from './Enum/Viewport/ScaffoldIdentifier';
import ConsumerScope = require('./Event/ConsumerScope');
import Loader = require('./Viewport/Loader');
import NavigationContainer = require('./Viewport/NavigationContainer');
import Persistent = require('./Storage/Persistent');
import Topbar = require('./Viewport/Topbar');

class Viewport {
  // The attributes are uppercase for compatibility reasons
  public readonly Loader: Loader = Loader;
  public readonly Topbar: Topbar;
  public readonly NavigationContainer: NavigationContainer = null;
  public readonly ContentContainer: ContentContainer = null;
  public readonly consumerScope: any = ConsumerScope;
  private document: HTMLDocument;
  private readonly navigationDragHandler: HTMLElement;

  constructor() {
    this.document = document;
    this.navigationDragHandler = <HTMLElement>document.querySelector(ScaffoldIdentifierEnum.contentNavigationDrag);
    let navigationSwitcher = <HTMLElement>document.querySelector(ScaffoldIdentifierEnum.contentNavigationSwitcher);
    this.initializeEvents();
    this.Topbar = new Topbar();
    this.NavigationContainer = new NavigationContainer(this.consumerScope, navigationSwitcher);
    this.ContentContainer = new ContentContainer(this.consumerScope);
    if (document.querySelector(ScaffoldIdentifierEnum.contentNavigation)) {
      this.NavigationContainer.setWidth(<number>Persistent.get('navigation.width'));
    }
    window.addEventListener('resize', this.fallbackNavigationSizeIfNeeded, {passive: true});
    if (navigationSwitcher) {
      navigationSwitcher.addEventListener('mouseup', this.toggleNavigation, {passive: true});
      navigationSwitcher.addEventListener('touchstart', this.toggleNavigation, {passive: true});
    }
    if (this.navigationDragHandler) {
      this.navigationDragHandler.addEventListener('mousedown', this.startResizeNavigation, {passive: true});
      this.navigationDragHandler.addEventListener('touchstart', this.startResizeNavigation, {passive: true});
    }
  }

  private fallbackNavigationSizeIfNeeded = (event: UIEvent) => {
    let window = <Window>event.currentTarget;
    if (this.NavigationContainer.getWidth() === 0) {
      return;
    }
    if (window.outerWidth < this.NavigationContainer.getWidth() + this.NavigationContainer.getPosition().left + 300) {
      this.NavigationContainer.autoWidth();
    }
  }

  private handleMouseMove = (event: MouseEvent) => {
    this.resizeNavigation(<number>event.clientX);
  }

  private handleTouchMove = (event: TouchEvent) => {
    this.resizeNavigation(<number>event.changedTouches[0].clientX);
  }

  private resizeNavigation = (position: number) => {
    let width = Math.round(position) - Math.round(this.NavigationContainer.getPosition().left);
    this.NavigationContainer.setWidth(width);
  }

  private stopResizeNavigation = () => {
    this.navigationDragHandler.classList.remove('resizing');
    this.document.removeEventListener('mousemove', this.handleMouseMove, false);
    this.document.removeEventListener('mouseup', this.stopResizeNavigation, false);
    this.document.removeEventListener('touchmove', this.handleTouchMove, false);
    this.document.removeEventListener('touchend', this.stopResizeNavigation, false);
    Persistent.set('navigation.width', <string><unknown>this.NavigationContainer.getWidth());
  }

  private startResizeNavigation = (event: MouseEvent | TouchEvent) => {
    if (event instanceof MouseEvent && event.button === 2) {
      return;
    }
    event.stopPropagation();
    this.navigationDragHandler.classList.add('resizing');
    this.document.addEventListener('mousemove', this.handleMouseMove, false);
    this.document.addEventListener('mouseup', this.stopResizeNavigation, false);
    this.document.addEventListener('touchmove', this.handleTouchMove, false);
    this.document.addEventListener('touchend', this.stopResizeNavigation, false);
  }

  private toggleNavigation = (event: MouseEvent | TouchEvent) => {
    if (event instanceof MouseEvent && event.button === 2) {
      return;
    }
    event.stopPropagation();
    this.NavigationContainer.toggle();
  }

  private initializeEvents(): void {
    document.addEventListener('typo3-module-load', (evt: CustomEvent) => {
      console.log('catched typo3-module-load', evt);
      let url = evt.detail.url;
      let urlParts = url.split('token=');
      if (urlParts.length < 2) {
        // non token-urls (e.g. backend install tool) cannot be mapped by
        // the main backend controller right now
        return;
      }
      if (urlParts[0].includes('/install/backend-user-confirmation')) {
        // @todo: this is an ugly hack for the installtool backend
        // module controller
        return;
      }
      let niceUrl = urlParts[0] + (urlParts[1].split('&', 2)[1] ?? '');
      niceUrl = niceUrl.replace(/\?$/, '');
      const decorate = evt.detail.decorate;
      const module = evt.detail.module || null;
      if (decorate) {
        // replace URL when browser automatically pushed a new
        // state to the history (e.g. when module iframe changes)
        // @todo: An alternative would be to use pushState() (together
        // with a special value in state) and call history.go(-1) in
        // window.onpopstate, but that does only work for backward
        // navigaton, not for forward navigation.
        window.history.replaceState({module, url}, 'TYPO3 Backend', niceUrl);
        //console.error('replacing state in load: ' + niceUrl);
      } else {
        // @todo: no used yet – may be used for non-iframe based modules (later)
        window.history.pushState({module, url}, 'TYPO3 Backend', niceUrl);
        //console.error('pushing state in load: ' + niceUrl);
      }
    });
    document.addEventListener('typo3-module-loaded', (evt: CustomEvent) => {
      console.log('catched typo3-module-loaded', evt);
      const module = evt.detail.module || null;
      const url = evt.detail.url || null;
      if (module || url) {
        window.history.replaceState({module, url}, 'TYPO3 Backend');
        //console.error('replacing state in loaded');
      }
    });
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
