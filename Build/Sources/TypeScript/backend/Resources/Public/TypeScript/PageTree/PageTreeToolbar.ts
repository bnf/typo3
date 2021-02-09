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

/** @ts-ignore */
import {select as d3select} from 'd3-selection';
import {render} from 'lit-html';
import {html, TemplateResult} from 'lit-element';
import {lll} from 'TYPO3/CMS/Core/lit-helper';
import {PageTreeDragDrop} from './PageTreeDragDrop';
import DebounceEvent from 'TYPO3/CMS/Core/Event/DebounceEvent';
import {ToolbarDragHandler} from 'TYPO3/CMS/Backend/PageTree/PageTreeDragHandler';
import 'TYPO3/CMS/Backend/Element/IconElement';

/**
 * @exports TYPO3/CMS/Backend/PageTree/PageTreeToolbar
 */
export class PageTreeToolbar
{
  private settings = {
    toolbarSelector: 'tree-toolbar',
    searchInput: '.search-input',
    filterTimeout: 450
  };

  private treeContainer: any;
  private targetEl: HTMLElement;

  private tree: any;
  private readonly dragDrop: any;

  public constructor(dragDrop: PageTreeDragDrop) {
    this.dragDrop = dragDrop;
  }

  public initialize(treeContainer: HTMLElement, toolbar: HTMLElement, settings: any = {}): void {
    this.treeContainer = treeContainer;
    this.targetEl = toolbar;

    if (!this.treeContainer.dataset.svgTreeInitialized
      || typeof this.treeContainer.svgtree !== 'object'
    ) {
      //both toolbar and tree are loaded independently through require js,
      //so we don't know which is loaded first
      //in case of toolbar being loaded first, we wait for an event from svgTree
      this.treeContainer.addEventListener('svg-tree:initialized', () => this.render());
      return;
    }

    Object.assign(this.settings, settings);
    this.render();
  }

  private refreshTree(): void {
    this.tree.refreshOrFilterTree();
  }

  private search(inputEl: HTMLInputElement): void {
    this.tree.searchQuery = inputEl.value.trim()
    this.tree.refreshOrFilterTree();
    this.tree.prepareDataForVisibleNodes();
    this.tree.update();
  }

  private showSubmenu(name: string): void {
    // @todo Replace those states with real data-binding in lit-element
    this.targetEl.querySelectorAll('[data-tree-show-submenu]')
      .forEach((element: HTMLElement) => {
        if (element.dataset.treeShowSubmenu === name) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      });
    this.targetEl.querySelectorAll('[data-tree-submenu]')
      .forEach((element: HTMLElement) => {
        if (element.dataset.treeSubmenu === name) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      });
    const submenu = this.targetEl.querySelector('[data-tree-submenu="' + name + '"]');
    const inputEl = submenu.querySelector('input');
    if (inputEl) {
      inputEl.focus();
      inputEl.clearable({
        onClear: () => {
          this.tree.resetFilter();
          this.tree.prepareDataForVisibleNodes();
          this.tree.update();
        }
      });
    }
  }

  private render(): void
  {
    this.tree = this.treeContainer.svgtree;
    // @todo Better use initialize() settings, drop this assignment here
    Object.assign(this.settings, this.tree.settings);

    render(this.renderTemplate(), this.targetEl);

    const d3Toolbar = d3select('.svg-toolbar');
    this.tree.settings.doktypes.forEach((item: any, id: number) => {
      if (item.icon) {
        d3Toolbar
          .selectAll('[data-tree-icon=' + item.icon + ']')
          .call(this.dragToolbar(item));
      } else {
        console.warn('Missing icon definition for doktype: ' + item.nodeType);
      }
    });

    new DebounceEvent('input', (evt: InputEvent) => {
      this.search(evt.target as HTMLInputElement);
    }, this.settings.filterTimeout)
      .bindTo(this.targetEl.querySelector(this.settings.searchInput));

    // @todo That always was a hack, to be replace with proper internal state handling
    const newPageSubmenu = this.targetEl.querySelector('[data-tree-show-submenu="page-new"]') as HTMLButtonElement;
    const firstToolbarButton = this.targetEl.querySelector('.svg-toolbar__menu :first-child:not(.js-svg-refresh)') as HTMLButtonElement;
    (newPageSubmenu ? newPageSubmenu : firstToolbarButton).click();
  }

  private renderTemplate(): TemplateResult {
    /* eslint-disable @typescript-eslint/indent */
    return html`
      <div class="${this.settings.toolbarSelector}">
        <div class="svg-toolbar__menu">
          <div class="btn-group">
            ${this.tree.settings.doktypes && this.tree.settings.doktypes.length > 0 ? html`
              <div class="x-btn btn btn-default btn-sm x-btn-noicon" data-tree-show-submenu="page-new" @click="${() => this.showSubmenu('page-new')}">
                <button class="svg-toolbar__btn" data-tree-icon="actions-page-new" title="${lll('tree.buttonNewNode')}">
                  <typo3-backend-icon identifier="actions-page-new" size="small"></typo3-backend-icon>
                </button>
              </div>
            ` : ''}
            <div class="x-btn btn btn-default btn-sm x-btn-noicon" data-tree-show-submenu="filter" @click="${() => this.showSubmenu('filter')}">
              <button class="svg-toolbar__btn" data-tree-icon="actions-filter" title="${lll('tree.buttonFilter')}">
                <typo3-backend-icon identifier="actions-filter" size="small"></typo3-backend-icon>
              </button>
            </div>
          </div>
          <div class="x-btn btn btn-default btn-sm x-btn-noicon js-svg-refresh" @click="${() => this.refreshTree()}">
            <button class="svg-toolbar__btn" data-tree-icon="actions-refresh" title="${lll('labels.refresh')}">
              <typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>
            </button>
          </div>
        </div>
        <div class="svg-toolbar__submenu">
          <div class="svg-toolbar__submenu-item" data-tree-submenu="filter">
            <input type="text" class="form-control search-input" placeholder="${lll('tree.searchTermInfo')}">
          </div>
          <div class="svg-toolbar__submenu-item" data-tree-submenu="page-new">
            ${this.tree.settings.doktypes && this.tree.settings.doktypes.length
              ? this.tree.settings.doktypes.map((item: any) => {
                return html`
                  <div class="svg-toolbar__drag-node" data-tree-icon="${item.icon}" data-node-type="${item.nodeType}"
                       title="${item.title}" tooltip="${item.tooltip}">
                    <typo3-backend-icon identifier="${item.icon}" size="small"></typo3-backend-icon>
                  </div>
                `;
              })
              : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Register Drag and drop for toolbar new elements
   *
   * Returns method from d3drag
   */
  private dragToolbar(itm: any) {
    return this.dragDrop.connectDragHandler(new ToolbarDragHandler(itm, this.tree, this.dragDrop));
  }
}
