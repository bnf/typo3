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

import {LitElement, html, css, CSSResult} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import {basicSetup} from 'codemirror';
import {Extension, EditorState, Transaction} from '@codemirror/state';
import {EditorView, ViewUpdate, keymap} from '@codemirror/view';
import {indentWithTab} from '@codemirror/commands';
import {oneDark} from '@codemirror/theme-one-dark';
import {executeJavaScriptModuleInstruction, JavaScriptItemPayload} from '@typo3/core/java-script-item-processor';
import '@typo3/backend/element/spinner-element'

interface MarkTextPosition {
  line: number;
  ch: number;
}
interface MarkText {
  to: MarkTextPosition;
  from: MarkTextPosition;
}

/**
 * Module: @typo3/t3editor/element/code-mirror-element
 * Renders CodeMirror into FormEngine
 */
@customElement('typo3-t3editor-codemirror')
export class CodeMirrorElement extends LitElement {
  @property({type: Object}) mode: JavaScriptItemPayload;
  @property({type: String}) label: string;
  @property({type: Array}) addons: string[] = [];
  @property({type: Object}) options: { [key: string]: any[] } = {};

  @property({type: Number}) scrollto: number = 0;
  @property({type: Object}) marktext: MarkText[] = [];
  @property({type: Number}) lineDigits: number = 0;
  @property({type: Boolean, reflect: true}) autoheight: boolean = false;
  @property({type: Boolean}) nolazyload: boolean = false;
  @property({type: Boolean}) readonly: boolean = false;
  @property({type: Boolean, reflect: true}) fullscreen: boolean = false;
  @property({type: String}) panel: string = 'bottom';

  @state() loaded: boolean = false;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    :host([fullscreen]) {
      position: fixed;
      inset: 64px 0 0;
      z-index: 9;
    }

    typo3-backend-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    #codemirror-parent {
      min-height: calc(8px + 12px * 1.4 * var(--rows, 18));
    }
    #codemirror-parent,
    .cm-editor {
      display: flex;
      flex-direction: column;
      flex: 1;
      max-height: 100%;
    }

    .cm-scroller {
      min-height: 100%;
      max-height: calc(100vh - 10rem);
    }

    :host([fullscreen]) .cm-scroller {
      min-height: initial;
      max-height: 100%;
    }

    :host([autoheight]) .cm-scroller {
      max-height: initial;
    }

    .panel {
      font-size: .85em;
      color: #abb2bf;
      background: #282c34;
      border-style: solid;
      border-color: #7d8799;
      border-width: 0;
      border-top-width: 1px;
      padding: .25em .5em;
    }

    .panel-top {
      border-top-width: 0;
      border-bottom-width: 1px;
      order: -1;
    }
  `;

  render() {
    return html`
      <div id="codemirror-parent" @keydown=${(e: KeyboardEvent) => this.onKeydown(e)}></div>
      ${this.label ? html`<div class="panel panel-${this.panel}">${this.label}</div>` : ''}
      ${this.loaded ? '' : html`<typo3-backend-spinner size="large" variant="dark"></typo3-backend-spinner>`}
    `;
  }

  firstUpdated(): void {
    if (this.nolazyload) {
      this.initializeEditor(<HTMLTextAreaElement>this.firstElementChild);
      return;
    }
    const observerOptions = {
      root: document.body
    };
    let observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
      entries.forEach((entry: IntersectionObserverEntry): void => {
        if (entry.intersectionRatio > 0) {
          observer.unobserve(entry.target);
          if (this.firstElementChild && this.firstElementChild.nodeName.toLowerCase() === 'textarea') {
            this.initializeEditor(<HTMLTextAreaElement>this.firstElementChild);
          }
        }
      });
    }, observerOptions);

    observer.observe(this);
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.altKey && event.key === 'f') {
      event.preventDefault();
      this.fullscreen = true;
    }
    if (event.key === 'Escape' && this.fullscreen) {
      event.preventDefault();
      this.fullscreen = false;
    }
  }

  private async initializeEditor(textarea: HTMLTextAreaElement): Promise<void> {
    const options = this.options;

    const updateListener = EditorView.updateListener.of((v: ViewUpdate) => {
      if (v.docChanged) {
        textarea.value = v.state.doc.toString();
        textarea.dispatchEvent(new CustomEvent('change', {bubbles: true}));
      }
    });

    if (textarea.getAttribute('rows')) {
      this.style.setProperty('--rows', textarea.getAttribute('rows'));
    }

    const extensions: Extension[] = [
      oneDark,
      basicSetup,
      keymap.of([indentWithTab]),
      updateListener,
    ];

    if (this.readonly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    if (this.mode) {
      const modeImplementation = <Extension[]>await executeJavaScriptModuleInstruction(this.mode);
      extensions.push(...modeImplementation);
    }

    const editorView = new EditorView({
      state: EditorState.create({
        doc: textarea.value,
        extensions
      }),
      parent: this.renderRoot.querySelector('#codemirror-parent'),
      root: this.renderRoot as ShadowRoot
    })
    this.loaded = true;


    /*
    // load mode + registered addons
    // @todo: Migrate away from RequireJS usage
    window.require(['codemirror', this.mode, ...this.addons], (CodeMirror: typeof import('codemirror')): void => {
      const cm = CodeMirror((node: HTMLElement): void => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('slot', 'codemirror');
        wrapper.appendChild(node);
        this.insertBefore(wrapper, textarea);
      }, {
        value: textarea.value,
        lineNumbers: true,
        lineWrapping: true,
        mode: modeParts[modeParts.length - 1],
      });

      // set options
      Object.keys(options).map((key: string): void => {
        cm.setOption(key, options[key]);
      });

      if (this.lineDigits > 0) {
        cm.setOption('lineNumberFormatter', (line: number): string => line.toString().padStart(this.lineDigits, ' '))
      }

      if (this.scrollto > 0) {
        cm.scrollIntoView({
          line: this.scrollto,
          ch: 0
        });
      }

      for (let textblock of this.marktext) {
        if (textblock.from && textblock.to) {
          cm.markText(textblock.from, textblock.to, {className: 'CodeMirror-markText'});
        }
      }

      this.loaded = true;
    });
  */
  }
}
