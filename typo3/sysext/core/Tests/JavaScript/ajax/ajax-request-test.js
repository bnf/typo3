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
import AjaxRequest from"@typo3/core/ajax/ajax-request.js";describe("@typo3/core/ajax/ajax-request",()=>{let e;beforeEach(()=>{const t=new Promise((t,o)=>{e={resolve:t,reject:o}});spyOn(window,"fetch").and.returnValue(t)}),it("sends GET request",()=>{new AjaxRequest("https://example.com").get(),expect(window.fetch).toHaveBeenCalledWith("https://example.com/",jasmine.objectContaining({method:"GET"}))});for(let e of["POST","PUT","DELETE"])describe(`send a ${e} request`,()=>{for(let t of function*(){yield["object as payload",e,{foo:"bar",bar:"baz",nested:{works:"yes"}},()=>{const e=new FormData;return e.set("foo","bar"),e.set("bar","baz"),e.set("nested[works]","yes"),e},{}],yield["JSON object as payload",e,{foo:"bar",bar:"baz",nested:{works:"yes"}},()=>JSON.stringify({foo:"bar",bar:"baz",nested:{works:"yes"}}),{"Content-Type":"application/json"}],yield["JSON string as payload",e,JSON.stringify({foo:"bar",bar:"baz",nested:{works:"yes"}}),()=>JSON.stringify({foo:"bar",bar:"baz",nested:{works:"yes"}}),{"Content-Type":"application/json"}]}()){let[e,o,a,r,n]=t;const s=o.toLowerCase();it("with "+e,e=>{new AjaxRequest("https://example.com")[s](a,{headers:n}),expect(window.fetch).toHaveBeenCalledWith("https://example.com/",jasmine.objectContaining({method:o,body:r()})),e()})}});describe("send GET requests",()=>{for(let t of function*(){yield["plaintext","foobar huselpusel",{},(e,t)=>{expect("string"==typeof e).toBeTruthy(),expect(e).toEqual(t)}],yield["JSON",JSON.stringify({foo:"bar",baz:"bencer"}),{"Content-Type":"application/json"},(e,t)=>{expect("object"==typeof e).toBeTruthy(),expect(JSON.stringify(e)).toEqual(t)}],yield["JSON with utf-8",JSON.stringify({foo:"bar",baz:"bencer"}),{"Content-Type":"application/json; charset=utf-8"},(e,t)=>{expect("object"==typeof e).toBeTruthy(),expect(JSON.stringify(e)).toEqual(t)}]}()){let[o,a,r,n]=t;it("receives a "+o+" response",t=>{const o=new Response(a,{headers:r});e.resolve(o),new AjaxRequest("https://example.com").get().then(async e=>{const o=await e.resolve();expect(window.fetch).toHaveBeenCalledWith("https://example.com/",jasmine.objectContaining({method:"GET"})),n(o,a),t()})})}}),describe("send requests with different input urls",()=>{for(let e of function*(){yield["absolute url with domain","https://example.com",{},"https://example.com/"],yield["absolute url with domain, with query parameter","https://example.com",{foo:"bar",bar:{baz:"bencer"}},"https://example.com/?foo=bar&bar[baz]=bencer"],yield["absolute url without domain","/foo/bar",{},window.location.origin+"/foo/bar"],yield["absolute url without domain, with query parameter","/foo/bar",{foo:"bar",bar:{baz:"bencer"}},window.location.origin+"/foo/bar?foo=bar&bar[baz]=bencer"],yield["relative url without domain","foo/bar",{},window.location.origin+"/foo/bar"],yield["relative url without domain, with query parameter","foo/bar",{foo:"bar",bar:{baz:"bencer"}},window.location.origin+"/foo/bar?foo=bar&bar[baz]=bencer"],yield["fallback to current script if not defined","?foo=bar&baz=bencer",{},window.location.origin+window.location.pathname+"?foo=bar&baz=bencer"]}()){let[t,o,a,r]=e;it("with "+t,()=>{new AjaxRequest(o).withQueryArguments(a).get(),expect(window.fetch).toHaveBeenCalledWith(r,jasmine.objectContaining({method:"GET"}))})}}),describe("send requests with query arguments",()=>{for(let e of function*(){yield["single level of arguments",{foo:"bar",bar:"baz"},"https://example.com/?foo=bar&bar=baz"],yield["nested arguments",{foo:"bar",bar:{baz:"bencer"}},"https://example.com/?foo=bar&bar[baz]=bencer"],yield["string argument","hello=world&foo=bar","https://example.com/?hello=world&foo=bar"],yield["array of arguments",["foo=bar","husel=pusel"],"https://example.com/?foo=bar&husel=pusel"],yield["object with array",{foo:["bar","baz"]},"https://example.com/?foo[0]=bar&foo[1]=baz"],yield["complex object",{foo:"bar",nested:{husel:"pusel",bar:"baz",array:["5","6"]},array:["1","2"]},"https://example.com/?foo=bar&nested[husel]=pusel&nested[bar]=baz&nested[array][0]=5&nested[array][1]=6&array[0]=1&array[1]=2"],yield["complex, deeply nested object",{foo:"bar",nested:{husel:"pusel",bar:"baz",array:["5","6"],deep_nested:{husel:"pusel",bar:"baz",array:["5","6"]}},array:["1","2"]},"https://example.com/?foo=bar&nested[husel]=pusel&nested[bar]=baz&nested[array][0]=5&nested[array][1]=6&nested[deep_nested][husel]=pusel&nested[deep_nested][bar]=baz&nested[deep_nested][array][0]=5&nested[deep_nested][array][1]=6&array[0]=1&array[1]=2"]}()){let[t,o,a]=e;it("with "+t,()=>{new AjaxRequest("https://example.com/").withQueryArguments(o).get(),expect(window.fetch).toHaveBeenCalledWith(a,jasmine.objectContaining({method:"GET"}))})}})});