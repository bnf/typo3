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
 * This handler is used as client-side counterpart of `\TYPO3\CMS\Core\Page\JavaScriptRenderer`.
 * It either can be used standalone or as requireJS module internally.
 *
 * @module TYPO3/CMS/Core/JavaScriptHandler
 * @internal Use in TYPO3 core only, API can change at any time!
 */
(function() {
  "use strict";

  // @todo Handle document.currentScript.async
  if (!document.currentScript) {
    return false;
  }

  const FLAG_LOAD_REQUIRE_JS = 1;
  const FLAG_LOAD_FROM_IMPORTMAP = 2;
  const FLAG_USE_TOP_WINDOW = 16;
  const deniedProperties = ['__proto__', 'prototype', 'constructor'];
  const allowedRequireJsItemTypes = ['assign', 'invoke', 'instance'];
  const allowedRequireJsNames = ['globalAssignment', 'javaScriptModuleInstruction'];
  const allowedDirectNames = ['processTextContent', 'loadRequireJs', 'processItems', 'globalAssignment', 'javaScriptModuleInstruction'];
  const scriptElement = document.currentScript;

  class JavaScriptHandler {

    /**
     * @param {any} payload
     * @param {string} payload.name module name
     * @return Promise<typeof import(payload.name)>
     */
    static importModule(payload) {
      if (!payload.name) {
        throw new Error('JavaScript module name is required');
      }
      if ((payload.flags & FLAG_LOAD_FROM_IMPORTMAP) === FLAG_LOAD_FROM_IMPORTMAP) {
        if (!(payload.flags & FLAG_USE_TOP_WINDOW)) {
          return importShim(payload.name);
        } else {
          return new Promise((resolve, reject) => {
            top.document.dispatchEvent(new CustomEvent('typo3:import-module', {
              detail: {
                loaded: (module) => resolve(module),
                error: (e) => reject(e),
              }
            }));
          });
        }
      } else if ((payload.flags & FLAG_LOAD_REQUIRE_JS) === FLAG_LOAD_REQUIRE_JS) {
        return new Promise((resolve, reject) => {
          const windowRef = (payload.flags & FLAG_USE_TOP_WINDOW) === FLAG_USE_TOP_WINDOW ? top.window : window;
          windowRef.require([payload.name], (module) => resolve(module), (e) => reject(e));
        });
      }
    }

    /**
     * @param {any} json
     * @param {string} json.name module name
     * @param {string} json.exportName? name used internally to export the module
     * @param {array<{type: string, assignments?: object, method?: string, args: array}>} json.items
     */
    static executeJavaScriptModuleInstruction(json) {
      // `name` is required
      if (!json.name) {
        throw new Error('JavaScript module name is required');
      }
      if (!json.items) {
        JavaScriptHandler.importModule(json);
        return;
      }
      const exportName = json.exportName;
      const resolveSubjectRef = (__esModule) => {
        return typeof exportName === 'string' ? __esModule[exportName] :
          (((json.flags & FLAG_LOAD_REQUIRE_JS) === FLAG_LOAD_REQUIRE_JS) ? __esModule : __esModule.default);
      }
      const items = json.items
        .filter((item) => allowedRequireJsItemTypes.includes(item.type))
        .map((item) => {
          if (item.type === 'assign') {
            return (__esModule) => {
              const subjectRef = resolveSubjectRef(__esModule);
              JavaScriptHandler.mergeRecursive(subjectRef, item.assignments);
            };
          } else if (item.type === 'invoke') {
            return (__esModule) => {
              if (typeof __esModule === 'undefined') {
                console.error('JavaScriptHandler: invoke-instruction: module is undefined', json.name)
                return;
              }
              const subjectRef = resolveSubjectRef(__esModule);
              //console.info'JavaScriptHandler: invoke-instruction', json.name, item.method)
              if (!(item.method in subjectRef)) {
                console.error('JavaScriptHandler: invoke-instruction: subjectRef not in module', json.name, item.method, __esModule)
              }
              subjectRef[item.method].apply(subjectRef, item.args);
            };
          } else if (item.type === 'instance') {
            return (__esModule) => {
              if (typeof __esModule === 'undefined') {
                console.error('JavaScriptHandler: instance-instruction: module is undefined', json.name)
                return;
              }
              // this `null` is `thisArg` scope of `Function.bind`,
              // which will be reset when invoking `new`
              const args = [null].concat(item.args);
              const subjectRef = resolveSubjectRef(__esModule);
              new (subjectRef.bind.apply(subjectRef, args));
            }
          }
        });

      JavaScriptHandler.importModule(json).then(
        (subjectRef) => items.forEach((item) => item.call(null, subjectRef))
      );
    }

    static isObjectInstance(item) {
      return item instanceof Object && !(item instanceof Array);
    }

    static isArrayInstance(item) {
      return item instanceof Array;
    }

    static mergeRecursive(target, source) {
      Object.keys(source).forEach((property) => {
        if (deniedProperties.indexOf(property) !== -1) {
          throw new Error('Property ' + property + ' is not allowed');
        }
        if (!JavaScriptHandler.isObjectInstance(source[property]) || typeof target[property] === 'undefined') {
          Object.assign(target, {[property]:source[property]});
        } else {
          JavaScriptHandler.mergeRecursive(target[property], source[property]);
        }
      });
    }

    constructor(invokableNames) {
      this.invokableNames = invokableNames;
    }

    invoke(name, data, isParsed = false) {
      if (!this.invokableNames.includes(name) || typeof this[name] !== 'function') {
        throw new Error('Unknown handler name "' + name + '"');
      }
      this[name].call(this, data, Boolean(isParsed));
    }

    /**
     * @param {string} type of sub-handler (processItems, loadRequireJs, globalAssignment, javaScriptModuleInstruction)
     */
    processTextContent(type) {
      // extracts JSON payload from `/* [JSON] */` content
      this.invoke(type, scriptElement.textContent.replace(/^\s*\/\*\s*|\s*\*\/\s*/g, ''));
    }

    /**
     * Initializes require.js configuration - require.js sources must be loaded already.
     * @param {string|any} data JSON data
     * @param {boolean} isParsed whether data has been parsed already
     */
    loadRequireJs(data, isParsed = false) {
      const payload = isParsed ? data : JSON.parse(data);
      if (!JavaScriptHandler.isObjectInstance(payload)) {
        throw new Error('Expected payload object');
      }
      require.config(payload.config);
    }

    /**
     * Processes multiple items and delegates to sub-handlers
     * (processItems, loadRequireJs, globalAssignment, javaScriptModuleInstruction)
     * @param {string|any[]} data JSON data
     * @param {boolean} isParsed whether data has been parsed already
     */
    processItems(data, isParsed = false) {
      const payload = isParsed ? data : JSON.parse(data);
      if (!JavaScriptHandler.isArrayInstance(payload)) {
        throw new Error('Expected payload array');
      }
      payload.forEach((item) => this.invoke(item.type, item.payload, true));
    }

    /**
     * Assigns (filtered) variables to `window` object globally.
     * @param {string|any} data JSON data
     * @param {boolean} isParsed whether data has been parsed already
     */
    globalAssignment(data, isParsed = false) {
      const payload = isParsed ? data : JSON.parse(data);
      if (!JavaScriptHandler.isObjectInstance(payload)) {
        throw new Error('Expected payload object');
      }
      JavaScriptHandler.mergeRecursive(window, payload);
    }

    /**
     * Loads and invokes a requires.js module (AMD).
     * @param {string|any} data JSON data
     * @param {boolean} isParsed whether data has been parsed already
     */
    javaScriptModuleInstruction(data, isParsed = false) {
      const payload = isParsed ? data : JSON.parse(data);
      JavaScriptHandler.executeJavaScriptModuleInstruction(payload);
    }
  }

  // called using requireJS
  if (scriptElement.dataset.requirecontext && scriptElement.dataset.requiremodule) {
    const handler = new JavaScriptHandler(allowedRequireJsNames);
    define(['require','exports'], () => {
      return handler;
    });
  // called directly using `<script>` element
  } else {
    const handler = new JavaScriptHandler(allowedDirectNames);
    // start processing dataset declarations
    Object.keys(scriptElement.dataset).forEach((name) => {
      try {
        handler.invoke(name, scriptElement.dataset[name]);
      } catch (e) {
        console.error(e);
      }
    });
  }
})();
