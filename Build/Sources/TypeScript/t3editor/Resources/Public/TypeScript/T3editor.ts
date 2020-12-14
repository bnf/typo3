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

import CodeMirror from 'cm/lib/codemirror';
import {LitElement, html, customElement, property, internalProperty} from 'lit-element';
import FormEngine = require('TYPO3/CMS/Backend/FormEngine');
import DocumentService = require('TYPO3/CMS/Core/DocumentService');

@customElement('typo3-editor')
class T3editorElement extends LitElement {
  @property() mode: string;
  @property({type: Array}) addons: string[] = [];
  @property({type: Object}) options: { [key: string]: any[] } = {};

  render() {
    return html`<slot></slot>`;
  }

  firstUpdated(): void {
    const observerOptions = {
      root: document.body
    };
    let observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
      entries.forEach((entry: IntersectionObserverEntry): void => {
        if (entry.intersectionRatio > 0) {
          observer.unobserve(entry.target);
          this.initializeEditor(<HTMLInputElement>entry.target);
        }
      })
    }, observerOptions);

    const textarea = this.querySelector('textarea');
    if (textarea) {
      observer.observe(textarea);
    }
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

  private initializeEditor(textarea: HTMLInputElement): void {
    const modeParts = this.mode.split('/');
    const options = this.options;

    // load mode + registered addons
    require([this.mode, ...this.addons], (): void => {
      const cm = CodeMirror.fromTextArea(textarea, {
        extraKeys: {
          'Ctrl-F': 'findPersistent',
          'Cmd-F': 'findPersistent',
          'Ctrl-Alt-F': (codemirror: any): void => {
            codemirror.setOption('fullScreen', !codemirror.getOption('fullScreen'));
          },
          'Ctrl-Space': 'autocomplete',
          'Esc': (codemirror: any): void => {
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
        FormEngine.Validation.markFieldAsChanged(textarea);
      });

      const bottomPanel = this.createPanelNode('bottom', textarea.getAttribute('alt'));
      cm.addPanel(
        bottomPanel,
        {
          position: 'bottom',
          stable: false,
        },
      );

      // cm.addPanel() changes the height of the editor, thus we have to override it here again
      if (textarea.getAttribute('rows')) {
        const lineHeight = 18;
        const paddingBottom = 4;
        cm.setSize(null, parseInt(textarea.getAttribute('rows'), 10) * lineHeight + paddingBottom + bottomPanel.getBoundingClientRect().height);
      } else {
        // Textarea has no "rows" attribute configured, don't limit editor in space
        cm.getWrapperElement().style.height = (document.body.getBoundingClientRect().height - cm.getWrapperElement().getBoundingClientRect().top - 80) + 'px';
        cm.setOption('viewportMargin', Infinity);
      }
    });
  }
}

/**
 * Module: TYPO3/CMS/T3editor/T3editor
 * Renders CodeMirror into FormEngine
 * @exports TYPO3/CMS/T3editor/T3editor
 * @todo: deprecate class and all methods
 */
class T3editor {

  /**
   * @param {string} position
   * @param {string} label
   * @returns {HTMLElement}
   */
  public static createPanelNode(position: string, label: string): HTMLElement {
    const node = document.createElement('div');
    node.setAttribute('class', 'CodeMirror-panel CodeMirror-panel-' + position);
    node.setAttribute('id', 'panel-' + position);

    const span = document.createElement('span');
    span.textContent = label;

    node.appendChild(span);

    return node;
  }

  /**
   * The constructor, set the class properties default values
   */
  constructor() {
    this.initialize();
  }

  /**
   * Initialize the events
   */
  public initialize(): void {
    DocumentService.ready().then((): void => {
      this.observeEditorCandidates();
    });

  }

  /**
   * Initializes CodeMirror on available texteditors
   */
  public observeEditorCandidates(): void {
    document.querySelectorAll('textarea.t3editor').forEach((textarea: HTMLTextAreaElement): void => {
      if (textarea.parentElement.tagName.toLowerCase() === 'typo3-editor') {
        return;
      }
      const editor = document.createElement('typo3-editor');
      const config = JSON.parse(textarea.getAttribute('data-codemirror-config'));
      editor.setAttribute('mode', config.mode);
      editor.setAttribute('addons', config.addons);
      editor.setAttribute('options', config.options);

      this.wrap(textarea, editor);
    });
  }

  private wrap(toWrap: HTMLElement, wrapper: HTMLElement) {
    toWrap.parentElement.insertBefore(wrapper, toWrap);
    wrapper.appendChild(toWrap);
  };
}

// create an instance and return it
export = new T3editor();
