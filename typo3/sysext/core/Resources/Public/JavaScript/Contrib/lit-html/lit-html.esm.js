export { removeNodes, reparentNodes } from './lib/dom.esm.js';
export { Template, createMarker, isTemplatePartActive } from './lib/template.esm.js';
export { directive, isDirective } from './lib/directive.esm.js';
export { noChange, nothing } from './lib/part.esm.js';
export { TemplateInstance } from './lib/template-instance.esm.js';
import { TemplateResult, SVGTemplateResult } from './lib/template-result.esm.js';
export { SVGTemplateResult, TemplateResult } from './lib/template-result.esm.js';
export { AttributeCommitter, AttributePart, BooleanAttributePart, EventPart, NodePart, PropertyCommitter, PropertyPart, isIterable, isPrimitive } from './lib/parts.esm.js';
export { templateCaches, templateFactory } from './lib/template-factory.esm.js';
export { parts, render } from './lib/render.esm.js';
import { defaultTemplateProcessor } from './lib/default-template-processor.esm.js';
export { DefaultTemplateProcessor, defaultTemplateProcessor } from './lib/default-template-processor.esm.js';

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.3.0');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */
const svg = (strings, ...values) => new SVGTemplateResult(strings, values, 'svg', defaultTemplateProcessor);

export { html, svg };
