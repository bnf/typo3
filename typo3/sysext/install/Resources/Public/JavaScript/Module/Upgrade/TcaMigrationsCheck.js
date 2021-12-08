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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Install/Module/AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Install/Renderable/FlashMessage","TYPO3/CMS/Install/Renderable/InfoBox","TYPO3/CMS/Install/Renderable/ProgressBar","TYPO3/CMS/Install/Renderable/Severity","TYPO3/CMS/Install/Router"],(function(e,t,n,s,r,a,o,i,l,c,u){"use strict";n=__importDefault(n);class d extends s.AbstractInteractableModule{constructor(){super(...arguments),this.selectorCheckTrigger=".t3js-tcaMigrationsCheck-check",this.selectorOutputContainer=".t3js-tcaMigrationsCheck-output"}initialize(e){this.currentModal=e,this.check(),e.on("click",this.selectorCheckTrigger,e=>{e.preventDefault(),this.check()})}check(){this.setModalButtonsState(!1);const e=n.default(this.selectorOutputContainer),t=this.getModalBody(),s=l.render(c.loading,"Loading...","");e.empty().html(s),new a(u.getUrl("tcaMigrationsCheck")).get({cache:"no-cache"}).then(async e=>{const n=await e.resolve();if(t.empty().append(n.html),r.setButtons(n.buttons),!0===n.success&&Array.isArray(n.status))if(n.status.length>0){const e=i.render(c.warning,"TCA migrations need to be applied","Check the following list and apply needed changes.");t.find(this.selectorOutputContainer).empty(),t.find(this.selectorOutputContainer).append(e),n.status.forEach(e=>{const n=i.render(e.severity,e.title,e.message);t.find(this.selectorOutputContainer).append(n)})}else{const e=i.render(c.ok,"No TCA migrations need to be applied","Your TCA looks good.");t.find(this.selectorOutputContainer).append(e)}else{const e=o.render(c.error,"Something went wrong",'Use "Check for broken extensions"');t.find(this.selectorOutputContainer).append(e)}},e=>{u.handleAjaxError(e,t)})}}return new d}));