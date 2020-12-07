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
define(["jquery","./Icons"],(function(t,e){"use strict";class a{constructor(){this.preSubmitCallbacks=[],t(()=>{this.initializeSaveHandling()})}static getInstance(){return null===a.instance&&(a.instance=new a),a.instance}addPreSubmitCallback(t){if("function"!=typeof t)throw"callback must be a function.";this.preSubmitCallbacks.push(t)}initializeSaveHandling(){let a=!1;const n=["button[form]",'button[name^="_save"]','a[data-name^="_save"]','button[name="CMD"][value^="save"]','a[data-name="CMD"][data-value^="save"]'].join(",");t(".t3js-module-docheader").on("click",n,n=>{if(!a){a=!0;const r=t(n.currentTarget),i=r.attr("form")||r.attr("data-form")||null,s=i?t("#"+i):r.closest("form"),l=r.data("name")||n.currentTarget.getAttribute("name"),u=r.data("value")||n.currentTarget.getAttribute("value"),o=t("<input />").attr("type","hidden").attr("name",l).attr("value",u);for(let t of this.preSubmitCallbacks)if(t(n),n.isPropagationStopped())return a=!1,!1;s.append(o),s.on("submit",()=>{if(s.find(".has-error").length>0)return a=!1,!1;let t;const n=r.closest(".t3js-splitbutton");return n.length>0?(n.find("button").prop("disabled",!0),t=n.children().first()):(r.prop("disabled",!0),t=r),e.getIcon("spinner-circle-dark",e.sizes.small).then(e=>{t.find(".t3js-icon").replaceWith(e)}),!0}),"A"!==n.currentTarget.tagName&&!r.attr("form")||n.isDefaultPrevented()||(s.find('[name="doSave"]').val("1"),s.trigger("submit"),n.preventDefault())}return!0})}}return a.instance=null,a}));