define(['require', '../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../backend/Resources/Public/JavaScript/FormEngine', 'cm/lib/codemirror'], function (require, jquery, FormEngine, CodeMirror) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) { return e; } else {
            var n = Object.create(null);
            if (e) {
                Object.keys(e).forEach(function (k) {
                    if (k !== 'default') {
                        var d = Object.getOwnPropertyDescriptor(e, k);
                        Object.defineProperty(n, k, d.get ? d : {
                            enumerable: true,
                            get: function () {
                                return e[k];
                            }
                        });
                    }
                });
            }
            n['default'] = e;
            return Object.freeze(n);
        }
    }

    var CodeMirror__default = /*#__PURE__*/_interopDefaultLegacy(CodeMirror);

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
     * Module: TYPO3/CMS/T3editor/T3editor
     * Renders CodeMirror into FormEngine
     * @exports TYPO3/CMS/T3editor/T3editor
     */
    class T3editor {
        /**
         * @param {string} position
         * @param {string} label
         * @returns {HTMLElement}
         */
        static createPanelNode(position, label) {
            const $panelNode = jquery('<div />', {
                class: 'CodeMirror-panel CodeMirror-panel-' + position,
                id: 'panel-' + position,
            }).append(jquery('<span />').text(label));
            return $panelNode.get(0);
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
        initialize() {
            jquery(() => {
                this.observeEditorCandidates();
            });
        }
        /**
         * Initializes CodeMirror on available texteditors
         */
        observeEditorCandidates() {
            const observerOptions = {
                root: document.body
            };
            let observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > 0) {
                        const $target = jquery(entry.target);
                        if (!$target.prop('is_t3editor')) {
                            this.initializeEditor($target);
                        }
                    }
                });
            }, observerOptions);
            document.querySelectorAll('textarea.t3editor').forEach((textarea) => {
                observer.observe(textarea);
            });
        }
        initializeEditor($textarea) {
            const config = $textarea.data('codemirror-config');
            const modeParts = config.mode.split('/');
            const addons = jquery.merge([modeParts.join('/')], JSON.parse(config.addons));
            const options = JSON.parse(config.options);
            // load mode + registered addons
            Promise.all(addons.map((module) => new Promise(function (resolve, reject) { require([module], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject) }))).then(() => {
                const cm = CodeMirror__default['default'].fromTextArea($textarea.get(0), {
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
                jquery.each(options, (key, value) => {
                    cm.setOption(key, value);
                });
                // Mark form as changed if code editor content has changed
                cm.on('change', () => {
                    FormEngine.Validation.markFieldAsChanged($textarea);
                });
                const bottomPanel = T3editor.createPanelNode('bottom', $textarea.attr('alt'));
                cm.addPanel(bottomPanel, {
                    position: 'bottom',
                    stable: false,
                });
                // cm.addPanel() changes the height of the editor, thus we have to override it here again
                if ($textarea.attr('rows')) {
                    const lineHeight = 18;
                    const paddingBottom = 4;
                    cm.setSize(null, parseInt($textarea.attr('rows'), 10) * lineHeight + paddingBottom + bottomPanel.getBoundingClientRect().height);
                }
                else {
                    // Textarea has no "rows" attribute configured, don't limit editor in space
                    cm.getWrapperElement().style.height = (document.body.getBoundingClientRect().height - cm.getWrapperElement().getBoundingClientRect().top - 80) + 'px';
                    cm.setOption('viewportMargin', Infinity);
                }
            });
            $textarea.prop('is_t3editor', true);
        }
    }
    // create an instance and return it
    var T3editor$1 = new T3editor();

    return T3editor$1;

});
