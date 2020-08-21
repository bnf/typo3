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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){this.options={onChangeSelector:'[data-global-event="change"]',onClickSelector:'[data-global-event="click"]',onSubmitSelector:'form[data-global-event="submit"]'},e.ready().then(()=>this.registerEvents())}registerEvents(){new t("change",this.handleChangeEvent.bind(this)).delegateTo(document,this.options.onChangeSelector),new t("click",this.handleClickEvent.bind(this)).delegateTo(document,this.options.onClickSelector),new t("submit",this.handleSubmitEvent.bind(this)).delegateTo(document,this.options.onSubmitSelector)}handleChangeEvent(e,t){e.preventDefault(),this.handleFormChildSubmitAction(e,t)||this.handleFormChildNavigateAction(e,t)}handleClickEvent(e,t){e.preventDefault()}handleSubmitEvent(e,t){e.preventDefault(),this.handleFormNavigateAction(e,t)}handleFormChildSubmitAction(e,t){const n=t.dataset.actionSubmit;if(!n)return!1;if("$form"===n&&this.isHTMLFormChildElement(t))return t.form.submit(),!0;const a=document.querySelector(n);return a instanceof HTMLFormElement&&(a.submit(),!0)}handleFormChildNavigateAction(e,t){const n=t.dataset.actionNavigate;if(!n)return!1;const a=this.resolveHTMLFormChildElementValue(t),i=t.dataset.navigateValue;return"$data=~s/$value/"===n&&i&&null!==a?(window.location.href=this.substituteValueVariable(i,a),!0):"$data"===n&&i?(window.location.href=i,!0):!("$value"!==n||!a)&&(window.location.href=a,!0)}handleFormNavigateAction(e,t){const n=t.action,a=t.dataset.actionNavigate;if(!n||!a)return!1;const i=t.dataset.navigateValue,l=t.dataset.valueSelector,o=this.resolveHTMLFormChildElementValue(t.querySelector(l));return"$form=~s/$value/"===a&&i&&null!==o?(window.location.href=this.substituteValueVariable(i,o),!0):"$form"===a&&(window.location.href=n,!0)}substituteValueVariable(e,t){return e.replace(/(\$\{value\}|%24%7Bvalue%7D|\$\[value\]|%24%5Bvalue%5D)/gi,t)}isHTMLFormChildElement(e){return e instanceof HTMLSelectElement||e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement}resolveHTMLFormChildElementValue(e){const t=e.getAttribute("type");if(e instanceof HTMLSelectElement)return e.options[e.selectedIndex].value;if(e instanceof HTMLInputElement&&"checkbox"===t){const t=e.dataset.emptyValue;return e.checked?e.value:void 0!==t?t:""}return e instanceof HTMLInputElement?e.value:null}}}));