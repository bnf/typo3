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
import t from"@typo3/backend/icons.js";class e{constructor(t){this.isSubmitting=!1,this.preSubmitCallbacks=[],t.addEventListener("submit",this.submitHandler.bind(this))}addPreSubmitCallback(t){if("function"!=typeof t)throw"callback must be a function.";return this.preSubmitCallbacks.push(t),this}submitHandler(e){if(!this.isSubmitting){for(const t of this.preSubmitCallbacks){if(!t(e))return void e.preventDefault()}this.isSubmitting=!0,null!==e.submitter&&((e.submitter instanceof HTMLInputElement||e.submitter instanceof HTMLButtonElement)&&(e.submitter.disabled=!0),t.getIcon("spinner-circle",t.sizes.small).then((t=>{e.submitter.replaceChild(document.createRange().createContextualFragment(t),e.submitter.querySelector(".t3js-icon"))})).catch((()=>{})))}}}export{e as default};