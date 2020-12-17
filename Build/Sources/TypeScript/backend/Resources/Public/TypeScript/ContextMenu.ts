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
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import RegularEvent = require('TYPO3/CMS/Core/Event/RegularEvent');
import ContextMenuActions = require('./ContextMenuActions');
import ThrottleEvent = require('TYPO3/CMS/Core/Event/ThrottleEvent');
import {html, css, customElement, property, LitElement, TemplateResult, CSSResult} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {ifDefined} from 'lit-html/directives/if-defined';
import {classMap} from 'lit-html/directives/class-map';
import {spread} from 'TYPO3/CMS/Core/lit-helper';

import 'TYPO3/CMS/Backend/Element/IconElement';

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
  icon?: string;
  iconIdentifier?: string;
  label: string;
  additionalAttributes?: { [key: string]: string };
  childItems?: MenuItems;
  callbackAction?: string;
}

interface MenuItems {
  [key: string]: MenuItem;
}

class ContextMenu {
  public record: ActiveRecord = {uid: null, table: null};

  private mousePos: MousePosition = {X: null, Y: null};
  private delayContextMenuHide: boolean = false;
  private eventSources: Element[] = [];
  private element: ContextMenuElement = null;

  /**
   * @param {JQuery} $element
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  private static within($element: JQuery, x: number, y: number): boolean {
    const offset = $element.offset();
    return (
      y >= offset.top &&
      y < offset.top + $element.height() &&
      x >= offset.left &&
      x < offset.left + $element.width()
    );
  }

  constructor() {
    //@todo who/what triggered the "contextmenu" event?
    new RegularEvent('click', (e: Event, me: HTMLElement) => {
      // if there is an other "inline" onclick setting, context menu is not triggered
      // usually this is the case for the foldertree
      if (me.onclick) {
        return;
      }
      e.preventDefault();
      this.show(
        me.dataset.table,
        parseInt(me.dataset.uid, 10) || 0,
        me.dataset.context,
        me.dataset.iteminfo,
        me.dataset.parameters,
        e.target as Element
      );
    }).delegateTo(document, '.t3js-contextmenutrigger');

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
   * @param {Element} eventSource Source Element
   */
  public show(table: string, uid: number|string, context: string, enDisItems: string, addParams: string, eventSource: Element = null): void {
    this.record = {table: table, uid: uid};
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
  public fetch(parameters: string): void {
    const url = TYPO3.settings.ajaxUrls.contextmenu;
    (new AjaxRequest(url)).withQueryArguments(parameters).get().then(async (response: AjaxResponse): Promise<any> => {
      const data: MenuItems = await response.resolve();
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
  private populateData(items: MenuItems, level: number): void {
    this.initializeContextMenuElement();
    console.log('populate', this);
    this.element.record = this.record;
    this.element.items = items;
    this.element.level = level;

    if (level === 0 || $('#contentMenu' + (level - 1)).is(':visible')) {
      const position = this.getPosition(this.element, false);
      this.element.style.left = position.left;
      this.element.style.top = position.top;
      this.element.removeAttribute('hidden');
      //$obj.css(this.getPosition(this.element, false)).show();
    }
  }

  /**
   * Manipulates the DOM to add the elment needed for context menu to the bottom of the <body>-tag
   */
  private initializeContextMenuElement(): void {
    this.element = this.element || (document.querySelector('typo3-backend-context-menu') as ContextMenuElement);
    if (this.element === null) {
      this.element = document.createElement('typo3-backend-context-menu') as ContextMenuElement;
      this.element.setAttribute('id', 'contentMenu0');
      document.body.appendChild(this.element);
    }
  }

  private getPosition(obj: HTMLElement, keyboard: boolean): {[key: string]: string} {
    let x = 0, y = 0;
    if (this.eventSources.length && (this.mousePos.X === null || keyboard)) {
      const boundingRect = this.eventSources[this.eventSources.length - 1].getBoundingClientRect();
      x = this.eventSources.length > 1 ? boundingRect.right : boundingRect.x;
      y = boundingRect.y;
    } else {
      x = this.mousePos.X;
      y = this.mousePos.Y;
    }
    const dimsWindow = {
      width: document.body.clientWidth - 20, // saving margin for scrollbars
      height: document.body.clientHeight
    };

    // dimensions for the context menu
    const dims = {
      width: obj.getBoundingClientRect().width,
      height: obj.getBoundingClientRect().height,
    };

    const relative = {
      X: x - document.scrollingElement.scrollLeft,
      Y: y - document.scrollingElement.scrollTop,
    };

    // adjusting the Y position of the layer to fit it into the window frame
    // if there is enough space above then put it upwards,
    // otherwise adjust it to the bottom of the window
    if (dimsWindow.height - dims.height < relative.Y) {
      if (relative.Y > dims.height) {
        y -= (dims.height - 10);
      } else {
        y += (dimsWindow.height - dims.height - relative.Y);
      }
    }
    // adjusting the X position like Y above, but align it to the left side of the viewport if it does not fit completely
    if (dimsWindow.width - dims.width < relative.X) {
      if (relative.X > dims.width) {
        x -= (dims.width - 10);
      } else if ((dimsWindow.width - dims.width - relative.X) < document.scrollingElement.scrollLeft) {
        x = document.scrollingElement.scrollLeft;
      } else {
        x += (dimsWindow.width - dims.width - relative.X);
      }
    }

    return {left: x + 'px', top: y + 'px'};
  }

  /**
   * event handler function that saves the
   * actual position of the mouse
   * in the context menu object
   *
   * @param {JQueryEventObject} event The event object
   */
  private storeMousePositionEvent = (event: JQueryEventObject): void => {
    this.mousePos = {X: event.pageX, Y: event.pageY};
    this.mouseOutFromMenu('#contentMenu0');
    this.mouseOutFromMenu('#contentMenu1');
  }

  /**
   * hides a visible menu if the mouse has moved outside
   * of the object
   *
   * @param {string} obj The identifier of the object to hide
   */
  private mouseOutFromMenu(obj: string): void {
    const $element = $(obj);

    if ($element.length > 0 && $element.is(':visible') && !ContextMenu.within($element, this.mousePos.X, this.mousePos.Y)) {
      this.hide(obj);
    } else if ($element.length > 0 && $element.is(':visible')) {
      this.delayContextMenuHide = true;
    }
  }

  /**
   * @param {string} obj
   */
  private hide(obj: string): void {
    this.delayContextMenuHide = false;
    window.setTimeout(
      (): void => {
        if (!this.delayContextMenuHide) {
          document.querySelector(obj).setAttribute('hidden', '');
          const source = <HTMLElement>this.eventSources.pop();
          if (source) {
            source.focus();
          }
        }
      },
      500
    );
  }

  /**
   * Hides all context menus
   */
  private hideAll(): void {
    this.hide('#contentMenu0');
    this.hide('#contentMenu1');
  }
}

@customElement('typo3-backend-context-menu')
class ContextMenuElement extends LitElement {

  @property({type: Array}) items: MenuItems = null;
  @property({type: Number}) level: number = -1;
  @property({type: Boolean}) hidden: boolean = false;
  @property({type: Object}) record: ActiveRecord = {uid: null, table: null};

  private mousePos: MousePosition = {X: null, Y: null};
  private delayContextMenuHide: boolean = false;
  private eventSources: Element[] = [];

  public static get styles(): CSSResult
  {
    return css`
      :host {
        display: block;
        position: absolute;
        z-index: 300;
      }
      :host([hidden]) {
        display: none;
      }
      ul {
        list-style: none;
        margin-bottom: 0;
        background-color: #fff;
        min-width: 150px;
        display: flex;
        flex-direction: column;
        padding-left: 0;
        border-radius: .125rem;
      }
      li {
        display: block;
        margin-bottom: 0;
        cursor: pointer;
        padding: .5em;
        border: 1px solid rgba(0,0,0,.125);
        position: relative;
        background-color: #fff;
      }
      li:not(:first-child) {
        border-top-color: transparent;
      }
      li:not(:last-child):not(.divider) {
        border-bottom-color: transparent;
      }
      li.divider {
        display: block;
        padding: 0 0 1px;
        margin: 0 0 1px;
        width: 100%;
      }
      li:hover,
      li:focus {
        z-index: 1; /* Place hover/focus items above their siblings for proper border styling */
        text-decoration: none;
        background-color: rgba(0,0,0,.04);
      }
      li:focus {
        outline: 1px auto Highlight;
        outline: 1px auto -webkit-focus-ring-color;
        outline-offset: -3px;
      }
      typo3-backend-icon {
        width: calc(18em/14);
        text-align: center;
      }
    `;
  }

  public render(): TemplateResult {
    const elements = this.drawMenu(this.items, this.level);
    return html`
      <ul>${elements}</ul>
    `;
  }

  public updated(): void {
    const firstItem = <HTMLElement> this.renderRoot.querySelector('li[role="menuitem"][tabindex="-1"]')
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * @param {MenuItem} item
   * @returns {TemplateResult}
   */
  private drawActionItem(item: MenuItem): TemplateResult {
    const attributes: { [key: string]: string } = item.additionalAttributes || {};

    return html`
      <li
        role="menuitem"
        tabindex="-1"
        data-callback-action="${item.callbackAction}"
        @click="${this.handleListGroupItemClick}"
        @keydown="${this.handleListGroupItemKeydown}"
        ...="${spread(attributes)}"
      >
        <typo3-backend-icon identifier="${ifDefined(item.iconIdentifier)}" raw="${ifDefined(item.icon)}" size="small"></typo3-backend-icon> ${item.label}
      </li>
    `;
  }

  private handleListGroupItemClick(event: Event) {
    event.preventDefault();
    const me = event.target as HTMLElement;

    if (me.classList.contains('submenu')) {
      this.openSubmenu(this.level, me);
      return;
    }

    const callbackName = me.dataset.callbackAction;
    const callbackModule = me.dataset.callbackModule;
    if (callbackModule) {
      require([callbackModule], (callbackModuleCallback: any): void => {
        // @todo deprecate binding $(me)
        callbackModuleCallback[callbackName].bind($(me))(this.record.table, this.record.uid);
      });
    } else if (ContextMenuActions && typeof (ContextMenuActions as any)[callbackName] === 'function') {
      // @todo deprecate binding $(me)
      (ContextMenuActions as any)[callbackName].bind($(me))(this.record.table, this.record.uid);
    } else {
      console.log('action: ' + callbackName + ' not found');
    }
    this.hidden = true;
  }

  private handleListGroupItemKeydown(event: KeyboardEvent) {
    const currentItem = event.currentTarget as HTMLElement;
    console.log('handleListGroupItemKeydown', event);
    //const $currentItem = $(event.currentTarget);
    switch (event.key) {
      case 'Down': // IE/Edge specific value
      case 'ArrowDown':
        this.setFocusToNextItem(currentItem);
        break;
      case 'Up': // IE/Edge specific value
      case 'ArrowUp':
        this.setFocusToPreviousItem(currentItem);
        break;
      case 'Right': // IE/Edge specific value
      case 'ArrowRight':
        if (currentItem.classList.contains('submenu')) {
          this.openSubmenu(this.level, currentItem);
        } else {
          return; // allow default behaviour of right key
        }
        break;
      case 'Home':
        this.setFocusToFirstItem(currentItem);
        break;
      case 'End':
        this.setFocusToLastItem(currentItem);
        break;
      case 'Enter':
      case 'Space':
        currentItem.click();
        break;
      case 'Esc': // IE/Edge specific value
      case 'Escape':
      case 'Left': // IE/Edge specific value
      case 'ArrowLeft':
        //this.hide('#' + $currentItem.parents('.context-menu').first().attr('id'));
        break;
      case 'Tab':
        this.hidden = true;
        break;
      default:
        return; // return to allow default keypress behaviour
    }
    // if not returned yet, prevent the default action of the event.
    event.preventDefault();
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
    let firstItem = this.getFirstItem(currentItem);
    if (firstItem) {
      firstItem.focus();
    }
  }

  private setFocusToLastItem(currentItem: HTMLElement): void {
    let lastItem = this.getLastItem(currentItem);
    if (lastItem) {
      lastItem.focus();
    }
  }

  /**
   * Returns passed element if it is a menu item, if not checks the previous elements until one is found.
   */
  private getItemBackward(element: Element): HTMLElement | null {
    while (element &&
      (element.getAttribute('role') !== 'menuitem' || (element.getAttribute('tabindex') !== '-1'))) {
      element = element.previousElementSibling;
    }
    return <HTMLElement>element;
  }

  /**
   * Returns passed element if it is a menu item, if not checks the previous elements until one is found.
   */
  private getItemForward(item: Element): HTMLElement | null {
    while (item &&
      (item.getAttribute('role') !== 'menuitem' || (item.getAttribute('tabindex') !== '-1'))) {
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

  /**
   * @param {number} level
   * @param {Element} item
   */
  private openSubmenu(level: number, item: Element): void {
    item.removeAttribute('style');
    /*
    this.eventSources.push($item[0]);
    const $obj = $('#contentMenu' + (level + 1)).html('');
    $item.next().find('.list-group').clone(true).appendTo($obj);
    $obj.css(this.getPosition($obj)).show();
    $('.list-group-item[tabindex=-1]',$obj).first().focus();
   */
  }
  /**
   * fills the context menu with content and displays it correctly
   * depending on the mouse position
   *
   * @param {MenuItems} items The data that will be put in the menu
   * @param {Number} level The depth of the context menu
   * @return TemplateResult
   */
  private drawMenu(items: MenuItems, level: number): TemplateResult {
    const renderItem = (item: MenuItem) => {
      if (item.type === 'item') {
        return this.drawActionItem(item);
      } else if (item.type === 'divider') {
        return html`
          <li role="separator" class="divider"></li>
        `;
      } else if (item.type === 'submenu' || item.childItems) {
        const childElements = this.drawMenu(item.childItems, 1);
        let menuClasses: any = {
          'context-menu': true
        };
        const menuClassName = 'contentMenu' + (level + 1);
        menuClasses[menuClassName] = true;
        return html`
          <li role="menuitem" aria-haspopup="true" class="submenu" tabindex="-1">
            ${item.label}&nbsp;&nbsp;<typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon>
          </li>
          <div class="${classMap(menuClasses)}" style="display:none;">
            <ul role="menu" class="list-group">${childElements}</ul>
          </div>
        `;
      } else {
        return html``;
      }
    };
    return html`
      ${Object.values(items).map(renderItem)}
    `;
  }
}

export = new ContextMenu();
