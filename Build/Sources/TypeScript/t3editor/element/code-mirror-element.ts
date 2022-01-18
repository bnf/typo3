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
import { basicSetup } from 'codemirror';
import { Extension, EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import {Transaction} from '@codemirror/state';

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
  @property() label: string;
  @property({type: Array}) addons: string[] = ['codemirror/addon/display/panel'];
  @property({type: Object}) options: { [key: string]: any[] } = {};

  @property({type: Number}) scrollto: number = 0;
  @property({type: Object}) marktext: MarkText[] = [];
  @property({type: Number}) lineDigits: number = 0;
  @property({type: Boolean, reflect: true}) autoheight: boolean = false;
  @property({type: Boolean}) nolazyload: boolean = false;
  @property({type: String}) panel: string = 'bottom';

  @state() loaded: boolean = false;

  static styles = css`
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
   .cm-scroller {
     min-height: calc(8px + 12px * 1.4 * var(--rows, 18));
     max-height: calc(100vh - 10rem);
   }
   :host([autoheight]) .cm-scroller {
     max-height: initial;
  `;

  render() {
    return html`
      <div id="codemirror-parent"></div>
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

  private createPanelNode(position: string, label: string): HTMLElement {
    const node = document.createElement('div');
    node.setAttribute('class', 'CodeMirror-panel CodeMirror-panel-' + position);
    node.setAttribute('id', 'panel-' + position);

    const span = document.createElement('span');
    span.textContent = label;

    node.appendChild(span);

    return node;
  }

  private async initializeEditor(textarea: HTMLTextAreaElement): Promise<void> {
    //const modeParts = this.mode.split('/');
    const options = this.options;

    let editorView: EditorView;

    const updateListener = EditorView.updateListener.of((v: ViewUpdate) => {
      if (v.docChanged) {
        textarea.value = v.state.doc.toString();
        textarea.dispatchEvent(new CustomEvent('change', {bubbles: true}));
      }
    });

    if (textarea.getAttribute('rows')) {
      this.style.setProperty('--rows', textarea.getAttribute('rows'));
    }

    const modeImplementation = <Extension[]>await executeJavaScriptModuleInstruction(this.mode);

    editorView = new EditorView({
      state: EditorState.create({
        doc: textarea.value,
        extensions: [
          oneDark,
          basicSetup,
          updateListener,
          ...modeImplementation
        ]
      }),
      /*
      dispatch: (tr: Transaction) => {
        console.log('transaction', tr);
        //return (this as unknown as EditorView).update([tr]);
        return editorView.update([tr]);
      },
      */
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
        extraKeys: {
          'Ctrl-F': 'findPersistent',
          'Cmd-F': 'findPersistent',
          'Ctrl-Alt-F': (codemirror: typeof CodeMirror): void => {
            codemirror.setOption('fullScreen', !codemirror.getOption('fullScreen'));
          },
          'Ctrl-Space': 'autocomplete',
          'Esc': (codemirror: typeof CodeMirror): void => {
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
      Object.keys(options).map((key: string): void => {
        cm.setOption(key, options[key]);
      });

      // Mark form as changed if code editor content has changed
      cm.on('change', (): void => {
        textarea.value = cm.getValue();
        textarea.dispatchEvent(new CustomEvent('change', {bubbles: true}));
      });

      const panel = this.createPanelNode(this.panel, this.label);
      cm.addPanel(
        panel,
        {
          position: this.panel,
          stable: false,
        },
      );

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
