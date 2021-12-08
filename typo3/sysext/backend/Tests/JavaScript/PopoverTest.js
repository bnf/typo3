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
import $ from"jquery";import Popover from"TYPO3/CMS/Backend/Popover.js";describe("TYPO3/CMS/Backend/PopoverTest:",()=>{describe("initialize",()=>{const t=$("body"),e=$('<div data-bs-toggle="popover">');t.append(e),it("works with default selector",()=>{Popover.initialize(),expect(e[0].outerHTML).toBe('<div data-bs-toggle="popover" data-bs-original-title="" title=""></div>')});const o=$('<div data-bs-toggle="popover" data-title="foo">');t.append(o),it("works with default selector and title attribute",()=>{Popover.initialize(),expect(o[0].outerHTML).toBe('<div data-bs-toggle="popover" data-title="foo" data-bs-original-title="" title=""></div>')});const i=$('<div data-bs-toggle="popover" data-bs-content="foo">');t.append(i),it("works with default selector and content attribute",()=>{Popover.initialize(),expect(i[0].outerHTML).toBe('<div data-bs-toggle="popover" data-bs-content="foo" data-bs-original-title="" title=""></div>')});const a=$('<div class="t3js-popover">');t.append(a),it("works with custom selector",()=>{Popover.initialize(".t3js-popover"),expect(a[0].outerHTML).toBe('<div class="t3js-popover" data-bs-original-title="" title=""></div>')})}),describe("call setOptions",()=>{const t=$("body"),e=$('<div class="t3js-test-set-options" data-title="foo-title" data-bs-content="foo-content">');t.append(e),it("can set title",()=>{Popover.initialize(".t3js-test-set-options"),expect(e.attr("data-title")).toBe("foo-title"),expect(e.attr("data-bs-content")).toBe("foo-content"),expect(e.attr("data-bs-original-title")).toBe(""),expect(e.attr("title")).toBe(""),Popover.setOptions(e,{title:"bar-title"}),expect(e.attr("data-title")).toBe("foo-title"),expect(e.attr("data-bs-content")).toBe("foo-content"),expect(e.attr("data-bs-original-title")).toBe("bar-title"),expect(e.attr("title")).toBe("")});const o=$('<div class="t3js-test-set-options2" data-title="foo-title" data-bs-content="foo-content">');t.append(o),it("can set content",()=>{Popover.initialize(".t3js-test-set-options2"),Popover.show(o),expect(o.attr("data-title")).toBe("foo-title"),expect(o.attr("data-bs-content")).toBe("foo-content"),expect(o.attr("data-bs-original-title")).toBe(""),expect(o.attr("title")).toBe(""),Popover.setOptions(o,{content:"bar-content"}),expect(o.attr("data-title")).toBe("foo-title"),expect(o.attr("data-bs-content")).toBe("bar-content"),expect(o.attr("data-bs-original-title")).toBe("foo-title"),expect(o.attr("title")).toBe("")})})});