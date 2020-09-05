import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { css as i } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/css-tag.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { state as r } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/state.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import '../../../../../backend/Resources/Public/JavaScript/Element/SpinnerElement.esm.js';
import CodeMirror from '../../../../../core/Resources/Public/JavaScript/Contrib/codemirror.esm.js';

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
/**
 * Module: TYPO3/CMS/T3editor/Element/CodeMirrorElement
 * Renders CodeMirror into FormEngine
 */
let CodeMirrorElement = class CodeMirrorElement extends h {
    constructor() {
        super(...arguments);
        this.addons = ['codemirror/addon/display/panel'];
        this.options = {};
        this.scrollto = 0;
        this.marktext = [];
        this.lineDigits = 0;
        this.autoheight = false;
        this.nolazyload = false;
        this.panel = 'bottom';
        this.loaded = false;
    }
    render() {
        return T `
      <slot></slot>
      <slot name="codemirror"></slot>
      ${this.loaded ? '' : T `<typo3-backend-spinner size="large" variant="dark"></typo3-backend-spinner>`}
    `;
    }
    firstUpdated() {
        if (this.nolazyload) {
            this.initializeEditor(this.firstElementChild);
            return;
        }
        const observerOptions = {
            root: document.body
        };
        let observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.intersectionRatio > 0) {
                    observer.unobserve(entry.target);
                    if (this.firstElementChild && this.firstElementChild.nodeName.toLowerCase() === 'textarea') {
                        this.initializeEditor(this.firstElementChild);
                    }
                }
            });
        }, observerOptions);
        observer.observe(this);
    }
    createPanelNode(position, label) {
        const node = document.createElement('div');
        node.setAttribute('class', 'CodeMirror-panel CodeMirror-panel-' + position);
        node.setAttribute('id', 'panel-' + position);
        const span = document.createElement('span');
        span.textContent = label;
        node.appendChild(span);
        return node;
    }
    initializeEditor(textarea) {
        const modeParts = this.mode.split('/');
        const options = this.options;
        // load mode + registered addons
        Promise.all([this.mode, ...this.addons].map((module) => import(module))).then(() => {
            const cm = CodeMirror((node) => {
                const wrapper = document.createElement('div');
                wrapper.setAttribute('slot', 'codemirror');
                wrapper.appendChild(node);
                this.insertBefore(wrapper, textarea);
            }, {
                value: textarea.value,
                extraKeys: {
                    'Ctrl-F': 'findPersistent',
                    'Cmd-F': 'findPersistent',
                    'Ctrl-Alt-F': (codemirror) => {
                        codemirror.setOption('fullScreen', !codemirror.getOption('fullScreen'));
                    },
                    'Ctrl-Space': 'autocomplete',
                    'Esc': (codemirror) => {
                        if (codemirror.getOption('fullScreen')) {
                            codemirror.setOption('fullScreen', false);
                        }
                    },
                },
                fullScreen: false,
                lineNumbers: true,
                lineWrapping: true,
                mode: modeParts[modeParts.length - 1],
            });
            // set options
            Object.keys(options).map((key) => {
                cm.setOption(key, options[key]);
            });
            // Mark form as changed if code editor content has changed
            cm.on('change', () => {
                textarea.value = cm.getValue();
                textarea.dispatchEvent(new CustomEvent('change', { bubbles: true }));
            });
            const panel = this.createPanelNode(this.panel, this.label);
            cm.addPanel(panel, {
                position: this.panel,
                stable: false,
            });
            // cm.addPanel() changes the height of the editor, thus we have to override it here again
            if (textarea.getAttribute('rows')) {
                const lineHeight = 18;
                const paddingBottom = 4;
                cm.setSize(null, parseInt(textarea.getAttribute('rows'), 10) * lineHeight + paddingBottom + panel.getBoundingClientRect().height);
            }
            else {
                // Textarea has no "rows" attribute configured, don't limit editor in space
                cm.getWrapperElement().style.height = (document.body.getBoundingClientRect().height - cm.getWrapperElement().getBoundingClientRect().top - 80) + 'px';
                cm.setOption('viewportMargin', Infinity);
            }
            if (this.autoheight) {
                cm.setOption('viewportMargin', Infinity);
            }
            if (this.lineDigits > 0) {
                cm.setOption('lineNumberFormatter', (line) => line.toString().padStart(this.lineDigits, ' '));
            }
            if (this.scrollto > 0) {
                cm.scrollIntoView({
                    line: this.scrollto,
                    ch: 0
                });
            }
            for (let textblock of this.marktext) {
                if (textblock.from && textblock.to) {
                    cm.markText(textblock.from, textblock.to, { className: 'CodeMirror-markText' });
                }
            }
            this.loaded = true;
        });
    }
};
CodeMirrorElement.styles = i `
   :host {
     display: block;
     position: relative;
   }
   typo3-backend-spinner {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
   }
  `;
__decorate([
    e()
], CodeMirrorElement.prototype, "mode", void 0);
__decorate([
    e()
], CodeMirrorElement.prototype, "label", void 0);
__decorate([
    e({ type: Array })
], CodeMirrorElement.prototype, "addons", void 0);
__decorate([
    e({ type: Object })
], CodeMirrorElement.prototype, "options", void 0);
__decorate([
    e({ type: Number })
], CodeMirrorElement.prototype, "scrollto", void 0);
__decorate([
    e({ type: Object })
], CodeMirrorElement.prototype, "marktext", void 0);
__decorate([
    e({ type: Number })
], CodeMirrorElement.prototype, "lineDigits", void 0);
__decorate([
    e({ type: Boolean })
], CodeMirrorElement.prototype, "autoheight", void 0);
__decorate([
    e({ type: Boolean })
], CodeMirrorElement.prototype, "nolazyload", void 0);
__decorate([
    e({ type: String })
], CodeMirrorElement.prototype, "panel", void 0);
__decorate([
    r()
], CodeMirrorElement.prototype, "loaded", void 0);
CodeMirrorElement = __decorate([
    n('typo3-t3editor-codemirror')
], CodeMirrorElement);

export { CodeMirrorElement };
