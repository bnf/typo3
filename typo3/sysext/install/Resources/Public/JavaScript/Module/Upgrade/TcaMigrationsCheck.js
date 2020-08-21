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
define(["jquery","../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Renderable/FlashMessage","../../Renderable/InfoBox","../../Renderable/ProgressBar","../../Renderable/Severity","../../Router"],(function(e,t,n,s,r,o,a,i,c){"use strict";class l extends t.AbstractInteractableModule{constructor(){super(...arguments),this.selectorCheckTrigger=".t3js-tcaMigrationsCheck-check",this.selectorOutputContainer=".t3js-tcaMigrationsCheck-output"}initialize(e){this.currentModal=e,this.check(),e.on("click",this.selectorCheckTrigger,e=>{e.preventDefault(),this.check()})}check(){this.setModalButtonsState(!1);const t=e(this.selectorOutputContainer),l=this.getModalBody(),d=a.render(i.loading,"Loading...","");t.empty().html(d),new s(c.getUrl("tcaMigrationsCheck")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();if(l.empty().append(t.html),n.setButtons(t.buttons),!0===t.success&&Array.isArray(t.status))if(t.status.length>0){const e=o.render(i.warning,"TCA migrations need to be applied","Check the following list and apply needed changes.");l.find(this.selectorOutputContainer).empty(),l.find(this.selectorOutputContainer).append(e),t.status.forEach(e=>{const t=o.render(e.severity,e.title,e.message);l.find(this.selectorOutputContainer).append(t)})}else{const e=o.render(i.ok,"No TCA migrations need to be applied","Your TCA looks good.");l.find(this.selectorOutputContainer).append(e)}else{const e=r.render(i.error,"Something went wrong",'Use "Check for broken extensions"');l.find(this.selectorOutputContainer).append(e)}},e=>{c.handleAjaxError(e,l)})}}return new l}));