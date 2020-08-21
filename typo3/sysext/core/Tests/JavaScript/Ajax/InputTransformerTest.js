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
define(["TYPO3/CMS/Core/Ajax/InputTransformer"],(function(a){"use strict";describe("TYPO3/CMS/Core/Ajax/InputTransformer",()=>{it("converts object to FormData",()=>{const r=new FormData;r.set("foo","bar"),r.set("bar","baz"),r.set("nested[works]","yes"),expect(a.InputTransformer.toFormData({foo:"bar",bar:"baz",nested:{works:"yes"}})).toEqual(r)}),it("undefined values are removed in FormData",()=>{const r={foo:"bar",bar:"baz",removeme:void 0},e=new FormData;e.set("foo","bar"),e.set("bar","baz"),expect(a.InputTransformer.toFormData(r)).toEqual(e)}),it("converts object to SearchParams",()=>{expect(a.InputTransformer.toSearchParams({foo:"bar",bar:"baz",nested:{works:"yes"}})).toEqual("foo=bar&bar=baz&nested[works]=yes")}),it("merges array to SearchParams",()=>{expect(a.InputTransformer.toSearchParams(["foo=bar","bar=baz"])).toEqual("foo=bar&bar=baz")}),it("keeps string in SearchParams",()=>{expect(a.InputTransformer.toSearchParams("foo=bar&bar=baz")).toEqual("foo=bar&bar=baz")}),it("undefined values are removed in SearchParams",()=>{const r={foo:"bar",bar:"baz",removeme:void 0};expect(a.InputTransformer.toSearchParams(r)).toEqual("foo=bar&bar=baz")})})}));