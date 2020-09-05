import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { state as r } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/state.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import Persistent from '../Storage/Persistent.esm.js';
import { lll } from '../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';
import '../Element/IconElement.esm.js';

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
const selectorConverter = {
    fromAttribute(selector) {
        return document.querySelector(selector);
    }
};
let ResizableNavigation = class ResizableNavigation extends h {
    constructor() {
        super(...arguments);
        this.minimumWidth = 250;
        this.resizing = false;
        this.toggleNavigation = (event) => {
            if (event instanceof MouseEvent && event.button === 2) {
                return;
            }
            event.stopPropagation();
            this.parentContainer.classList.toggle('scaffold-content-navigation-expanded');
        };
        this.fallbackNavigationSizeIfNeeded = (event) => {
            let window = event.currentTarget;
            if (this.getNavigationWidth() === 0) {
                return;
            }
            if (window.outerWidth < this.getNavigationWidth() + this.getNavigationPosition().left + this.minimumWidth) {
                this.autoNavigationWidth();
            }
        };
        this.handleMouseMove = (event) => {
            this.resizeNavigation(event.clientX);
        };
        this.handleTouchMove = (event) => {
            this.resizeNavigation(event.changedTouches[0].clientX);
        };
        this.resizeNavigation = (position) => {
            let width = Math.round(position) - Math.round(this.getNavigationPosition().left);
            this.setNavigationWidth(width);
        };
        //@eventOptions({passive: true})
        this.startResizeNavigation = (event) => {
            if (event instanceof MouseEvent && event.button === 2) {
                return;
            }
            event.stopPropagation();
            this.resizing = true;
            document.addEventListener('mousemove', this.handleMouseMove, false);
            document.addEventListener('mouseup', this.stopResizeNavigation, false);
            document.addEventListener('touchmove', this.handleTouchMove, false);
            document.addEventListener('touchend', this.stopResizeNavigation, false);
        };
        this.stopResizeNavigation = () => {
            this.resizing = false;
            document.removeEventListener('mousemove', this.handleMouseMove, false);
            document.removeEventListener('mouseup', this.stopResizeNavigation, false);
            document.removeEventListener('touchmove', this.handleTouchMove, false);
            document.removeEventListener('touchend', this.stopResizeNavigation, false);
            Persistent.set(this.persistenceIdentifier, this.getNavigationWidth());
            document.dispatchEvent(new CustomEvent('typo3:navigation:resized'));
        };
    }
    connectedCallback() {
        super.connectedCallback();
        const initialWidth = this.initialWidth || parseInt(Persistent.get(this.persistenceIdentifier), 10);
        this.setNavigationWidth(initialWidth);
        window.addEventListener('resize', this.fallbackNavigationSizeIfNeeded, { passive: true });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.fallbackNavigationSizeIfNeeded);
    }
    // disable shadow dom
    createRenderRoot() {
        return this;
    }
    render() {
        return T `
      <div class="scaffold-content-navigation-switcher">
        <button @mouseup="${this.toggleNavigation}" @touchstart="${this.toggleNavigation}" class="btn btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-open" role="button" title="${lll('viewport_navigation_show')}">
          <typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon>
        </button>
        <button @mouseup="${this.toggleNavigation}" @touchstart="${this.toggleNavigation}" class="btn btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-close" role="button" title="${lll('viewport_navigation_hide')}">
          <typo3-backend-icon identifier="actions-chevron-left" size="small"></typo3-backend-icon>
        </button>
      </div>
      <div @mousedown="${this.startResizeNavigation}" @touchstart="${this.startResizeNavigation}" class="scaffold-content-navigation-drag ${this.resizing ? 'resizing' : ''}"></div>
    `;
    }
    getNavigationPosition() {
        return this.navigationContainer.getBoundingClientRect();
    }
    getNavigationWidth() {
        return this.navigationContainer.offsetWidth;
    }
    autoNavigationWidth() {
        this.navigationContainer.style.width = 'auto';
    }
    setNavigationWidth(width) {
        // Allow only 50% of the main document
        const maxWidth = Math.round(this.parentContainer.getBoundingClientRect().width / 2);
        if (width > maxWidth) {
            width = maxWidth;
        }
        width = width > this.minimumWidth ? width : this.minimumWidth;
        this.navigationContainer.style.width = width + 'px';
    }
};
__decorate([
    e({ type: Number, attribute: 'minimum-width' })
], ResizableNavigation.prototype, "minimumWidth", void 0);
__decorate([
    e({ type: Number, attribute: 'initial-width' })
], ResizableNavigation.prototype, "initialWidth", void 0);
__decorate([
    e({ type: String, attribute: 'persistence-identifier' })
], ResizableNavigation.prototype, "persistenceIdentifier", void 0);
__decorate([
    e({ attribute: 'parent', converter: selectorConverter })
], ResizableNavigation.prototype, "parentContainer", void 0);
__decorate([
    e({ attribute: 'navigation', converter: selectorConverter })
], ResizableNavigation.prototype, "navigationContainer", void 0);
__decorate([
    r()
], ResizableNavigation.prototype, "resizing", void 0);
ResizableNavigation = __decorate([
    n('typo3-backend-navigation-switcher')
], ResizableNavigation);
