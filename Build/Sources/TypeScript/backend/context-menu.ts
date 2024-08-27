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

import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import ContextMenuActions from './context-menu-actions';
import DebounceEvent from '@typo3/core/event/debounce-event';
import RegularEvent from '@typo3/core/event/regular-event';
import { selector } from '@typo3/core/literals';
import '@typo3/backend/element/spinner-element';

interface MousePosition {
  X: number;
  Y: number;
}

interface ActiveRecord {
  uid: number|string;
  table: string;
}

interface MenuItem {
  type: string;
  icon: string;
  label: string;
  additionalAttributes?: Record<string, string>;
  childItems?: MenuItems;
  callbackAction?: string;
}

interface MenuItems {
  [key: string]: MenuItem;
}

/**
 * Module: @typo3/backend/context-menu
 * Container used to load the context menu via AJAX to render the result in a layer next to the mouse cursor
 */
class ContextMenu {
  private mousePos: MousePosition = { X: null, Y: null };
  private record: ActiveRecord = { uid: null, table: null };
  private readonly eventSources: HTMLElement[] = [];

  constructor() {
    document.addEventListener('click', (event: PointerEvent) => {
      this.handleTriggerEvent(event);
    });

    document.addEventListener('contextmenu', (event: PointerEvent) => {
      this.handleTriggerEvent(event);
    });
  }

  /**
   * @param {MenuItem} item
   * @returns {string}
   */
  private static drawActionItem(item: MenuItem): HTMLElement {

    const menuitem = document.createElement('li');
    menuitem.role = 'menuitem';
    menuitem.classList.add('context-menu-item');
    menuitem.dataset.callbackAction = item.callbackAction;
    menuitem.tabIndex = -1;
    const attributes: Record<string, string> = item.additionalAttributes || {};
    for (const attribute of Object.entries(attributes)) {
      const [qualifiedName, value] = attribute;
      menuitem.setAttribute(qualifiedName, value);
    }

    const icon = document.createElement('span');
    icon.classList.add('context-menu-item-icon');
    icon.innerHTML = item.icon;

    const label = document.createElement('span');
    label.classList.add('context-menu-item-label');
    label.innerHTML = item.label;

    menuitem.append(icon);
    menuitem.append(label);

    return menuitem;
  }

  private static within(element: HTMLElement, x: number, y: number): boolean {
    const clientRect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const isInXBoundary = x >= clientRect.left + scrollLeft && x <= clientRect.left + scrollLeft + clientRect.width;
    const isInYBoundary = y >= clientRect.top + scrollTop && y <= clientRect.top + scrollTop + clientRect.height;

    return isInXBoundary && isInYBoundary;
  }

  /**
   * Main function, called from most context menu links
   *
   * @param {string} table Table from where info should be fetched
   * @param {number} uid The UID of the item
   * @param {string} context Context of the item
   * @param {string} unusedParam1
   * @param {string} unusedParam2
   * @param {HTMLElement} eventSource Source Element
   * @param {Event} originalEvent
   */
  public show(
    table: string,
    uid: number|string,
    context: string,
    unusedParam1: string,
    unusedParam2: string,
    eventSource: HTMLElement = null,
    originalEvent: PointerEvent = null
  ): void {
    this.hideAll();
    this.initializeContextMenuContainer();

    this.record = { table: table, uid: uid };
    const focusableSource = eventSource.matches('a, button, [tabindex]:not([tabindex="-1"])')
      ? eventSource
      : eventSource.closest('a, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    if (this.eventSources.includes(focusableSource) === false) {
      this.eventSources.push(focusableSource);
    }

    const parameters = new URLSearchParams();
    if (typeof table !== 'undefined') {
      parameters.set('table', table);
    }
    if (typeof uid !== 'undefined') {
      parameters.set('uid', uid.toString());
    }
    if (typeof context !== 'undefined') {
      parameters.set('context', context);
    }

    let position: MousePosition = null;
    if (originalEvent !== null) {
      this.storeMousePosition(originalEvent);
      position = this.mousePos;
    }
    this.fetch(parameters.toString(), position);
  }

  /**
   * Manipulates the DOM to add the divs needed for context menu at the bottom of the <body>-tag
   */
  private initializeContextMenuContainer(): void {
    if (document.querySelector('#contentMenu0') !== null) {
      return;
    }
    const contextMenu1 = document.createElement('div');
    contextMenu1.classList.add('context-menu');
    contextMenu1.id = 'contentMenu0';
    contextMenu1.style.display = 'none';
    document.querySelector('body').append(contextMenu1);

    const contextMenu2 = document.createElement('div');
    contextMenu2.classList.add('context-menu');
    contextMenu2.id = 'contentMenu1';
    contextMenu2.style.display = 'none';
    contextMenu2.dataset.parent = '#contentMenu0'
    document.querySelector('body').append(contextMenu2);

    document.querySelectorAll('.context-menu').forEach((contextMenu: Element): void => {
      // Explicitly update cursor position if element is entered to avoid timing issues
      new RegularEvent('mouseenter', (event: MouseEvent): void => {
        this.storeMousePosition(event);
      }).bindTo(contextMenu);

      new DebounceEvent('mouseleave', (event: MouseEvent) => {
        const target: HTMLElement = event.target as HTMLElement;
        const childMenu: HTMLElement | null = document.querySelector(selector`[data-parent="#${target.id}"]`);

        const hideThisMenu =
          !ContextMenu.within(target, this.mousePos.X, this.mousePos.Y) // cursor it outside triggered context menu
          && (childMenu === null || childMenu.offsetParent === null); // child menu, if any, is not visible

        if (hideThisMenu) {
          this.hide(target);

          // close parent menu (if any), if cursor is outside its boundaries
          let parent: HTMLElement | null;
          if (typeof target.dataset.parent !== 'undefined' && (parent = document.querySelector(target.dataset.parent)) !== null) {
            if (!ContextMenu.within(parent, this.mousePos.X, this.mousePos.Y)) {
              this.hide(document.querySelector(target.dataset.parent));
            }
          }
        }
      }, 500).bindTo(contextMenu);
    });
  }

  private handleTriggerEvent(event: PointerEvent): void
  {
    if (!(event.target instanceof Element)) {
      return;
    }

    const contextTarget = event.target.closest('[data-contextmenu-trigger]');
    if (contextTarget instanceof HTMLElement) {
      this.handleContextMenuEvent(event, contextTarget);
      return;
    }

    const contextMenu = event.target.closest('.context-menu');
    if (!contextMenu) {
      this.hideAll();
    }
  }

  private handleContextMenuEvent(event: PointerEvent, element: HTMLElement): void
  {
    const contextTrigger: string = element.dataset.contextmenuTrigger;
    if (contextTrigger === 'click' || contextTrigger === event.type) {
      event.preventDefault();
      this.show(
        element.dataset.contextmenuTable ?? '',
        element.dataset.contextmenuUid ?? '',
        element.dataset.contextmenuContext ?? '',
        '',
        '',
        element,
        event
      );
    }
  }

  /**
   * Make the AJAX request
   *
   * @param {string} parameters Parameters sent to the server
   * @param {MousePosition} position
   */
  private fetch(parameters: string, position: MousePosition): void {
    const stubMenu = this.renderStubMenu(0, position);
    const url = TYPO3.settings.ajaxUrls.contextmenu;
    (new AjaxRequest(url)).withQueryArguments(parameters).get().then(async (response: AjaxResponse): Promise<void> => {
      const data: MenuItems = await response.resolve();
      if (typeof response !== 'undefined' && Object.keys(response).length > 0) {
        this.populateData(data, 0, position);
      }
    }).catch((): void => {
      this.hide(stubMenu);
    });
  }

  private renderStubMenu(level: number, position: MousePosition): HTMLElement|null {
    const contentMenuCurrent = document.querySelector('#contentMenu' + level) as HTMLElement;
    if (contentMenuCurrent !== null) {
      contentMenuCurrent.replaceChildren(document.createRange().createContextualFragment('<typo3-backend-spinner size="medium"></typo3-backend-spinner>'));
      contentMenuCurrent.style.display = null;
      position = this.getPosition(contentMenuCurrent, position);
      const coordinates = this.toPixel(position);

      contentMenuCurrent.style.top = coordinates.top;
      contentMenuCurrent.style.insetInlineStart = coordinates.start;
    }

    return contentMenuCurrent;
  }

  /**
   * Fills the context menu with content and displays it correctly
   * depending on the mouse position
   *
   * @param {MenuItems} items The data that will be put in the menu
   * @param {number} level The depth of the context menu
   */
  private populateData(items: MenuItems, level: number, position: MousePosition): void {
    const contentMenuCurrent = document.querySelector('#contentMenu' + level) as HTMLElement;
    const contentMenuParent = document.querySelector('#contentMenu' + (level - 1)) as HTMLElement;
    if (contentMenuCurrent !== null && contentMenuParent?.offsetParent !== null) {
      const menuGroup = document.createElement('ul');
      menuGroup.classList.add('context-menu-group');
      menuGroup.role = 'menu';
      this.drawMenu(items, level).forEach((childItem) => {
        menuGroup.appendChild(childItem);
      });

      contentMenuCurrent.innerHTML = '';
      contentMenuCurrent.appendChild(menuGroup);
      position = this.getPosition(contentMenuCurrent, position);
      const coordinates = this.toPixel(position);
      contentMenuCurrent.style.top = coordinates.top;
      contentMenuCurrent.style.insetInlineStart = coordinates.start;
      contentMenuCurrent.style.display = null;
      (contentMenuCurrent.querySelector('.context-menu-item[tabindex="-1"]') as HTMLElement).focus();
      this.initializeEvents(contentMenuCurrent, level);
    }
  }

  private initializeEvents(contentMenu: HTMLElement, level: number) {
    contentMenu.querySelectorAll('li.context-menu-item').forEach((element: HTMLElement) => {
      // click
      element.addEventListener('click', (event: PointerEvent): void => {
        event.preventDefault();
        const target = event.currentTarget as HTMLElement;
        if (target.classList.contains('context-menu-item-submenu')) {
          this.openSubmenu(level, target);
          return;
        }
        const { callbackAction, callbackModule, ...dataAttributesToPass } = target.dataset;
        if (target.dataset.callbackModule) {
          import(callbackModule + '.js').then(({ default: callbackModuleCallback }: {default: any}): void => {
            callbackModuleCallback[callbackAction](this.record.table, this.record.uid, dataAttributesToPass);
          });
        } else if (ContextMenuActions && typeof (ContextMenuActions as any)[callbackAction] === 'function') {
          (ContextMenuActions as any)[callbackAction](this.record.table, this.record.uid, dataAttributesToPass);
        } else {
          console.error('action: ' + callbackAction + ' not found');
        }
        this.hideAll();
      });
      // keyboard control
      element.addEventListener('keydown', (event: KeyboardEvent): void => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        switch (event.key) {
          case 'Down': // IE/Edge specific value
          case 'ArrowDown':
            this.setFocusToNextItem(target);
            break;
          case 'Up': // IE/Edge specific value
          case 'ArrowUp':
            this.setFocusToPreviousItem(target);
            break;
          case 'Right': // IE/Edge specific value
          case 'ArrowRight':
            if (target.classList.contains('context-menu-item-submenu')) {
              this.openSubmenu(level, target);
            } else {
              return; // allow default behaviour of right key
            }
            break;
          case 'Home':
            this.setFocusToFirstItem(target);
            break;
          case 'End':
            this.setFocusToLastItem(target);
            break;
          case 'Enter':
          case 'Space':
            target.click();
            break;
          case 'Esc': // IE/Edge specific value
          case 'Escape':
          case 'Left': // IE/Edge specific value
          case 'ArrowLeft':
            this.hide(target.closest('.context-menu'));
            break;
          case 'Tab':
            this.hideAll();
            break;
          default:
            return; // return to allow default keypress behaviour
        }
      });
    });
  }

  private setFocusToPreviousItem(currentItem: HTMLElement): void {
    let previousItem = this.getItemBackward(currentItem.previousElementSibling);
    if (!previousItem) {
      previousItem = this.getLastItem(currentItem);
    }
    previousItem.focus();
  }

  private setFocusToNextItem(currentItem: HTMLElement): void {
    let nextItem = this.getItemForward(currentItem.nextElementSibling);
    if (!nextItem) {
      nextItem = this.getFirstItem(currentItem);
    }
    nextItem.focus();
  }

  private setFocusToFirstItem(currentItem: HTMLElement): void {
    const firstItem = this.getFirstItem(currentItem);
    if (firstItem) {
      firstItem.focus();
    }
  }

  private setFocusToLastItem(currentItem: HTMLElement): void {
    const lastItem = this.getLastItem(currentItem);
    if (lastItem) {
      lastItem.focus();
    }
  }

  /**
   * Returns passed element if it is a menu item, if not checks the previous elements until one is found.
   */
  private getItemBackward(element: Element): HTMLElement | null {
    while (element &&
      (!element.classList.contains('context-menu-item') || (element.getAttribute('tabindex') !== '-1'))) {
      element = element.previousElementSibling;
    }
    return <HTMLElement>element;
  }

  /**
   * Returns passed element if it is a menu item, if not checks the previous elements until one is found.
   */
  private getItemForward(item: Element): HTMLElement | null {
    while (item &&
      (!item.classList.contains('context-menu-item') || (item.getAttribute('tabindex') !== '-1'))) {
      item = item.nextElementSibling;
    }
    return <HTMLElement>item;
  }

  private getFirstItem(item: Element): HTMLElement | null {
    return this.getItemForward(item.parentElement.firstElementChild);
  }

  private getLastItem(item: Element): HTMLElement | null {
    return this.getItemBackward(item.parentElement.lastElementChild);
  }

  private openSubmenu(level: number, item: HTMLElement): void {
    if (this.eventSources.includes(item) === false) {
      this.eventSources.push(item);
    }

    const contentMenu = document.querySelector('#contentMenu' + (level + 1)) as HTMLElement|null;
    contentMenu.innerHTML = '';
    contentMenu.appendChild(item.nextElementSibling.querySelector('.context-menu-group').cloneNode(true));
    contentMenu.style.display = null;

    const position = this.toPixel(this.getPosition(contentMenu));
    contentMenu.style.top = position.top;
    contentMenu.style.insetInlineStart = position.start;
    (contentMenu.querySelector('.context-menu-item[tabindex="-1"]') as HTMLElement).focus();

    this.initializeEvents(contentMenu, level);
  }

  private toPixel(position: MousePosition): { start: string; top: string; } {
    return { start: Math.round(position.X) + 'px', top: Math.round(position.Y) + 'px' };
  }

  private getPosition(element: HTMLElement, position: MousePosition = null): MousePosition {

    const space = 10;
    const offset = 5;
    const direction = document.querySelector('html').dir === 'rtl' ? 'rtl' : 'ltr';
    const origin: HTMLElement|undefined|null = this.eventSources?.[this.eventSources.length - 1];

    const dimensions = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };

    const windowDimentions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let
      start : number = 0,
      top : number = 0;

    if (position !== null) {
      top = position.Y;
      start = direction === 'ltr' ? position.X : windowDimentions.width - position.X;
    } else if (origin !== undefined && origin !== null) {
      const boundingRect = origin.getBoundingClientRect();
      top = boundingRect.y;
      start = direction === 'ltr' ? boundingRect.x + boundingRect.width : windowDimentions.width - boundingRect.x;
      if (origin.classList.contains('context-menu-item-submenu')) {
        top -= 3 + offset;
      }
    } else {
      top = this.mousePos.Y;
      start = direction === 'ltr' ? this.mousePos.X : windowDimentions.width - this.mousePos.X;
    }

    const canPlaceBelow = (top + dimensions.height + space + offset < windowDimentions.height);
    const canPlaceStart = (start + dimensions.width + space + offset < windowDimentions.width);

    // adjusting the top position of the layer to fit it into the window frame
    if (!canPlaceBelow) {
      top = windowDimentions.height - dimensions.height - space;
    } else {
      top += offset;
    }

    // adjusting the start position of the layer to fit it into the window frame
    if (!canPlaceStart) {
      start = windowDimentions.width - dimensions.width - space;
    } else {
      start += offset;
    }

    return { X: start, Y: top };
  }

  /**
   * fills the context menu with content and displays it correctly
   * depending on the mouse position
   *
   * @param {MenuItems} items The data that will be put in the menu
   * @param {number} level The depth of the context menu
   */
  private drawMenu(items: MenuItems, level: number): Array<HTMLElement> {

    const elements: Array<HTMLElement> = [];
    for (const item of Object.values(items)) {
      if (item.type === 'item') {
        elements.push(ContextMenu.drawActionItem(item));
      } else if (item.type === 'divider') {
        const separator = document.createElement('li');
        separator.role = 'separator';
        separator.classList.add('context-menu-divider');
        elements.push(separator);
      } else if (item.type === 'submenu' || item.childItems) {
        const submenuItem = document.createElement('li');
        submenuItem.role = 'menuitem';
        submenuItem.ariaHasPopup = 'true';
        submenuItem.classList.add('context-menu-item', 'context-menu-item-submenu');
        submenuItem.tabIndex = -1;
        const submenuIcon = document.createElement('span');
        submenuIcon.classList.add('context-menu-item-icon');
        submenuIcon.innerHTML = item.icon;
        submenuItem.appendChild(submenuIcon);
        const submenuLabel = document.createElement('span');
        submenuLabel.classList.add('context-menu-item-label');
        submenuLabel.innerHTML = item.label;
        submenuItem.appendChild(submenuLabel);
        const submenuIndicator = document.createElement('span');
        submenuIndicator.classList.add('context-menu-item-indicator');
        submenuIndicator.innerHTML = '<typo3-backend-icon identifier="actions-chevron-' + (document.querySelector('html').dir === 'rtl' ? 'left' : 'right') + '" size="small" inline></typo3-backend-icon>';
        submenuItem.appendChild(submenuIndicator);
        elements.push(submenuItem);
        const submenu = document.createElement('div');
        submenu.classList.add('context-menu', 'contentMenu' + (level + 1));
        submenu.style.display = 'none';
        const submenuList = document.createElement('ul');
        submenuList.role = 'menu';
        submenuList.classList.add('context-menu-group');
        this.drawMenu(item.childItems, 1).forEach((childItem) => {
          submenuList.appendChild(childItem);
        })
        submenu.appendChild(submenuList);
        elements.push(submenu);
      }
    }
    return elements;
  }

  private storeMousePosition(event: MouseEvent): void {
    this.mousePos = { X: event.pageX, Y: event.pageY };
  }

  private hide(element: HTMLElement|null): void {
    if (element === null) {
      return;
    }

    element.style.top = null;
    element.style.insetInlineStart = null;
    element.style.display = 'none';
    const source = this.eventSources.pop();
    if (source) {
      source.focus()
    }
  }

  /**
   * Hides all context menus
   */
  private hideAll(): void {
    this.hide(document.querySelector('#contentMenu0'));
    this.hide(document.querySelector('#contentMenu1'));
  }
}

export default new ContextMenu();
