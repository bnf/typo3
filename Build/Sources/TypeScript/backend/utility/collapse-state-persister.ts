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

import Client from '@typo3/backend/storage/client';
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';

/**
 * Utility class to store a collapsible state in the localStorage and to re-apply states.
 * It uses the collapsible id to store the keys, which must be unique.
 *
 * Trigger state persisting by adding 'data-persist-collapse-state="true"' to a collapsible element.
 *
 * To improve performance when dealing with bigger trees:
 *   * A 'data-persist-collapse-state-suffix="some-suffix"' on each collapsible element can be defined: This
 *     specifies a local storage key instead of "general", states are then stored in this key. This is useful
 *     when bigger tree states are stored, moving them to a dedicated local storage key. Default is suffix "global".
 *   * A 'data-persist-collapse-state-if-state="shown"' (allowed values "shown" and "hidden"):
 *     Usually, both "collapsed" and "shown" states are stored in local storage. However, when a tree is rendered
 *     "hidden" or "shown" by default from Fluid, we only need the "opposite" state in local storage. It is good practice
 *     to set this to safe local storage space.
 *
 * When dealing with bigger treas, some of them may be search-aware: This is related to 'collapse-state-search.ts',
 * which expands search matches in a tree. We usually do not want to persist collapse / expand state when a search is
 * performed, since this is done by the search javascript. Instead, we want to go back to the previous expand/collapse
 * state when a search value is cleared. To do this, an expand/collapse field can set 'data-persist-collapse-state-not-if-search="true"',
 * which will suppress storing expand/collapse state from/to local storage if a search value is given.
 * When the search value is cleared (empty string), the current expand/collapse state are applied again due to
 * a submit event fired by 'collapse-state-search.ts', so this state class can re-create the expand/collapse state before
 * a search keyword has been given. A search input field needs the attribute 'data-persist-collapse-search-key="some-search-key"'
 * which points to the local storage key of the search term, plus class "t3js-collapse-search-term" to trigger all this search magic.
 *
 * @internal
 */
type PersistStateObject = { [key: string]: boolean };

export class CollapseStatePersister {
  private readonly localStorageKey: string = 'collapse-states-';
  private readonly localStorageKeyDefaultSuffix: string = 'general';
  private readonly searchValueSelector: string = '.t3js-collapse-search-term';
  private searchField: HTMLInputElement|null = null;
  private searchForm: HTMLFormElement|null = null;

  private readonly stateCache: Map<string, PersistStateObject>;

  public constructor() {
    this.stateCache = new Map();

    DocumentService.ready().then((): void => {
      this.searchField = document.querySelector(this.searchValueSelector);
      if (this.searchField !== null) {
        this.searchForm = this.searchField.closest('form');
        this.searchField.value = Client.get(this.searchField.dataset.persistCollapseSearchKey) ?? '';
      }
      this.registerEventListener();
      this.recoverStates();
    });
  }

  private registerEventListener(): void {
    const delegateEventTo: string = '.collapse[data-persist-collapse-state="true"]';

    new RegularEvent('show.bs.collapse', (e: Event): void => {
      const element: HTMLElement = e.target as HTMLElement;
      if (element.dataset.persistCollapseState === 'true'
        && ((this.searchField !== null && this.searchField.value === '') || element.dataset.persistCollapseStateNotIfSearch === undefined)
      ) {
        // Persist state only, if there is no search input field, or no search is performed
        this.toStorage(element, true);
      }
    }).delegateTo(document, delegateEventTo);

    new RegularEvent('hide.bs.collapse', (e: Event): void => {
      const element: HTMLElement = e.target as HTMLElement;
      if (element.dataset.persistCollapseState === 'true'
        && ((this.searchField !== null && this.searchField.value === '') || element.dataset.persistCollapseStateNotIfSearch === undefined)
      ) {
        // Persist state only, if there is no search input field, or no search is performed
        this.toStorage(element, false);
      }
    }).delegateTo(document, delegateEventTo);

    if (this.searchForm !== null) {
      new RegularEvent('submit', (e: SubmitEvent): void => {
        e.preventDefault();
        if (this.searchField !== null && this.searchField.value === '') {
          this.recoverStates();
        }
      }).bindTo(this.searchForm);
    }
  }

  private recoverStates(): void {
    const collapseStateElements: NodeListOf<HTMLElement>|null = document.querySelectorAll('.collapse[data-persist-collapse-state="true"]');
    collapseStateElements.forEach((element: HTMLElement) => {
      const suffix: string = element.dataset.persistCollapseStateSuffix ?? this.localStorageKeyDefaultSuffix;
      const currentStates = this.fromStorage(suffix);
      const id: string = element.id;
      if (id === '' || !this.shallRecoverState(element)) {
        return;
      }
      const storeExpandedState = (element.dataset.persistCollapseStateIfState ?? 'shown') === 'shown';
      const storeHiddenState = (element.dataset.persistCollapseStateIfState ?? 'hidden') === 'hidden';
      const isExpanded = element.classList.contains('show');
      if (storeExpandedState === true) {
        // We're not using BootstrapCollapse.getOrCreateInstance() since this is too slow when
        // dealing with many elements like with System > Configuration with TCA tree.
        if (currentStates[id] === true) {
          if (!isExpanded) {
            const toggle: HTMLElement = document.querySelector('[data-bs-target="#' + id + '"]');
            toggle.classList.remove('collapsed');
            toggle.setAttribute('aria-expanded', 'true');
            element.classList.add('show');
          }
        } else {
          if (isExpanded) {
            const toggle: HTMLElement = document.querySelector('[data-bs-target="#' + id + '"]');
            toggle.classList.add('collapsed');
            toggle.setAttribute('aria-expanded', 'false');
            element.classList.remove('show');
          }
        }
      }
      if (storeHiddenState === true) {
        if (currentStates[id] === false) {
          if (isExpanded) {
            const toggle: HTMLElement = document.querySelector('[data-bs-target="#' + id + '"]');
            toggle.classList.add('collapsed');
            toggle.setAttribute('aria-expanded', 'false');
            element.classList.remove('show');
          }
        } else {
          if (!isExpanded) {
            const toggle: HTMLElement = document.querySelector('[data-bs-target="#' + id + '"]');
            toggle.classList.remove('collapsed');
            toggle.setAttribute('aria-expanded', 'true');
            element.classList.add('show');
          }
        }
      }
    });
  }

  private shallRecoverState(element: HTMLElement): boolean {
    if (element.dataset.persistCollapseStateNotIfSearch === undefined
      || element.dataset.persistCollapseStateNotIfSearch === 'false'
    ) {
      return true;
    }
    return this.searchField !== null && this.searchField.value === '';
  }

  private fromStorage(suffix: string): PersistStateObject {
    let result;
    if (this.stateCache.has(this.localStorageKey + suffix)) {
      result = this.stateCache.get(this.localStorageKey + suffix);
    } else {
      const currentStates = Client.get(this.localStorageKey + suffix);
      result = currentStates !== null ? JSON.parse(currentStates) : {};
      this.stateCache.set(this.localStorageKey + suffix, result);
    }
    return result;
  }

  private toStorage(element: HTMLElement, expanded: boolean) {
    const key = element.id;
    const suffix = element.dataset.persistCollapseStateSuffix ?? this.localStorageKeyDefaultSuffix;
    const currentStates = this.fromStorage(suffix);
    const storeExpandedState = (element.dataset.persistCollapseStateIfState ?? 'shown') === 'shown';
    const storeHiddenState = (element.dataset.persistCollapseStateIfState ?? 'hidden') === 'hidden';
    if (expanded === true && storeExpandedState === true && currentStates[key] !== true) {
      currentStates[key] = true;
      this.updateStates(this.localStorageKey + suffix, currentStates);
    }
    if (expanded === true && storeHiddenState === true && currentStates[key] === false) {
      delete currentStates[key];
      this.updateStates(this.localStorageKey + suffix, currentStates);
    }
    if (expanded === false && storeHiddenState === true && currentStates[key] !== false) {
      currentStates[key] = false;
      this.updateStates(this.localStorageKey + suffix, currentStates);
    }
    if (expanded === false && storeExpandedState === true && currentStates[key] === true) {
      delete currentStates[key];
      this.updateStates(this.localStorageKey + suffix, currentStates);
    }
  }

  private updateStates(key: string, currentStates: PersistStateObject) {
    Client.set(key, JSON.stringify(currentStates));
    this.stateCache.set(key, currentStates);
  }
}

export default new CollapseStatePersister();
