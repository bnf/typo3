define(['../../../../core/Resources/Public/TypeScript/Event/RegularEvent', '../../../../core/Resources/Public/TypeScript/Event/DebounceEvent', './Input/Clearable'], function (RegularEvent, DebounceEvent, Clearable) { 'use strict';

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
    class NewContentElementWizard {
        constructor(context) {
            this.context = context.get(0);
            this.searchField = this.context.querySelector('.t3js-contentWizard-search');
            this.registerClearable();
            this.registerEvents();
        }
        static get default() {
            console.warn('The property .default of module NewContentElementWizard has been deprecated, use NewContentElementWizard directly.');
            return this;
        }
        static getTabIdentifier(tab) {
            const tabLink = tab.querySelector('a');
            const [, tabIdentifier] = tabLink.href.split('#');
            return tabIdentifier;
        }
        static countVisibleContentElements(container) {
            return container.querySelectorAll('.media-new-content-element-wizard:not(.hidden)').length;
        }
        focusSearchField() {
            this.searchField.focus();
        }
        registerClearable() {
            this.searchField.clearable({
                onClear: (input) => {
                    input.value = '';
                    this.filterElements(input);
                },
            });
        }
        registerEvents() {
            new RegularEvent('keydown', (e) => {
                const target = e.target;
                if (e.code === 'Escape') {
                    e.stopImmediatePropagation();
                    target.value = '';
                }
            }).bindTo(this.searchField);
            new DebounceEvent('keyup', (e) => {
                this.filterElements(e.target);
            }, 150).bindTo(this.searchField);
            new RegularEvent('submit', (e) => {
                e.preventDefault();
            }).bindTo(this.searchField.closest('form'));
            new RegularEvent('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            }).delegateTo(this.context, '.t3js-tabs .disabled');
        }
        filterElements(inputField) {
            const form = inputField.closest('form');
            const tabContainer = form.querySelector('.t3js-tabs');
            const nothingFoundAlert = form.querySelector('.t3js-filter-noresult');
            form.querySelectorAll('.media.media-new-content-element-wizard').forEach((element) => {
                // Clean up textContent by trimming and replacing consecutive spaces with a single space
                const textContent = element.textContent.trim().replace(/\s+/g, ' ');
                element.classList.toggle('hidden', inputField.value !== '' && !RegExp(inputField.value, 'i').test(textContent));
            });
            const visibleContentElements = NewContentElementWizard.countVisibleContentElements(form);
            tabContainer.parentElement.classList.toggle('hidden', visibleContentElements === 0);
            nothingFoundAlert.classList.toggle('hidden', visibleContentElements > 0);
            this.switchTabIfNecessary(tabContainer);
        }
        switchTabIfNecessary(tabContainer) {
            const currentActiveTab = tabContainer.querySelector('.active');
            const siblings = Array.from(currentActiveTab.parentNode.children);
            for (let sibling of siblings) {
                const siblingTabIdentifier = NewContentElementWizard.getTabIdentifier(sibling);
                sibling.classList.toggle('disabled', !this.hasTabContent(siblingTabIdentifier));
            }
            if (!this.hasTabContent(NewContentElementWizard.getTabIdentifier(currentActiveTab))) {
                for (let sibling of siblings) {
                    if (sibling === currentActiveTab) {
                        // We already know the current active tab has no content, that's why we're here in the first place
                        continue;
                    }
                    const siblingTabIdentifier = NewContentElementWizard.getTabIdentifier(sibling);
                    if (this.hasTabContent(siblingTabIdentifier)) {
                        this.switchTab(tabContainer.parentElement, siblingTabIdentifier);
                        break;
                    }
                }
            }
        }
        hasTabContent(tabIdentifier) {
            const tabContentContainer = this.context.querySelector(`#${tabIdentifier}`);
            return NewContentElementWizard.countVisibleContentElements(tabContentContainer) > 0;
        }
        /**
         * Switches the tab to the requested one. Unfortunately, bootstrap has a bug and searches the tab content in document,
         * whereas top.document is our correct context.
         *
         * @param {HTMLElement} tabContainerWrapper
         * @param {string} tabIdentifier
         */
        switchTab(tabContainerWrapper, tabIdentifier) {
            const tabElement = tabContainerWrapper.querySelector(`a[href="#${tabIdentifier}"]`);
            const tabContentElement = this.context.querySelector(`#${tabIdentifier}`);
            tabContainerWrapper.querySelector('.t3js-tabmenu-item.active').classList.remove('active');
            tabContainerWrapper.querySelector('.tab-pane.active').classList.remove('active');
            tabElement.parentElement.classList.add('active');
            tabContentElement.classList.add('active');
        }
    }

    return NewContentElementWizard;

});
