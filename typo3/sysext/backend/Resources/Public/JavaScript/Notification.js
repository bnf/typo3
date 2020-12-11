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
var __decorate=this&&this.__decorate||function(t,e,i,s){var a,o=arguments.length,r=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var n=t.length-1;n>=0;n--)(a=t[n])&&(r=(o<3?a(r):o>3?a(e,i,r):a(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r},__importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","jquery","lit-element","lit-html/directives/class-map","./Enum/Severity","./Severity","bootstrap"],(function(t,e,i,s,a,o,r){"use strict";i=__importDefault(i);class n{static notice(t,e,i,s){n.showMessage(t,e,o.SeverityEnum.notice,i,s)}static info(t,e,i,s){n.showMessage(t,e,o.SeverityEnum.info,i,s)}static success(t,e,i,s){n.showMessage(t,e,o.SeverityEnum.ok,i,s)}static warning(t,e,i,s){n.showMessage(t,e,o.SeverityEnum.warning,i,s)}static error(t,e,i=0,s){n.showMessage(t,e,o.SeverityEnum.error,i,s)}static showMessage(t,e,s=o.SeverityEnum.info,a=this.duration,n=[]){const c=r.getCssClass(s);let l="";switch(s){case o.SeverityEnum.notice:l="lightbulb-o";break;case o.SeverityEnum.ok:l="check";break;case o.SeverityEnum.warning:l="exclamation";break;case o.SeverityEnum.error:l="times";break;case o.SeverityEnum.info:default:l="info"}a=void 0===a?this.duration:"string"==typeof a?parseFloat(a):a,null!==this.messageContainer&&null!==document.getElementById("alert-container")||(this.messageContainer=i.default("<div>",{id:"alert-container"}).appendTo("body"));const p=document.createElement("typo3-notification-message");p.setAttribute("notificationId","notification-"+Math.random().toString(36).substr(2,5)),p.setAttribute("className",c),p.setAttribute("title",t),e&&p.setAttribute("message",e),p.setAttribute("icon",l),p.actions=n;const d=i.default(p);d.on("close.bs.alert",t=>{t.preventDefault(),d.clearQueue().queue(t=>{p.removeAttribute("visible"),t()}).slideUp({complete:()=>{d.remove()}})}),d.appendTo(this.messageContainer),d.delay(200).queue(t=>{p.setAttribute("visible",""),t()}),a>0&&d.delay(1e3*a).queue(t=>{p.closeNotification(),t()})}}n.duration=5,n.messageContainer=null;let c,l=class extends s.LitElement{constructor(){super(...arguments),this.visible=!1,this.executingAction=-1,this.actions=[]}createRenderRoot(){return this}async closeNotification(){await this.requestUpdate();const t=this.querySelector("#"+this.notificationId);i.default(t).alert("close")}render(){return s.html`
      <div
        id="${this.notificationId}"
        class="${"alert alert-"+this.className+" alert-dismissible fade"+(this.visible?" in":"")}"
        role="alert">
        <button type="button" class="close" data-dismiss="alert">
          <span aria-hidden="true"><i class="fa fa-times-circle"></i></span>
          <span class="sr-only">Close</span>
        </button>
        <div class="media">
          <div class="media-left">
            <span class="fa-stack fa-lg">
              <i class="fa fa-circle fa-stack-2x"></i>
              <i class="${"fa fa-"+this.icon+" fa-stack-1x"}"></i>
            </span>
          </div>
          <div class="media-body">
            <h4 class="alert-title">${this.title}</h4>
            <p class="alert-message text-pre-wrap">${this.message?this.message:""}</p>
          </div>
        </div>
        ${0===this.actions.length?"":s.html`
          <div class="alert-actions">
            ${this.actions.map((t,e)=>s.html`
              <a href="#"
                 title="${t.label}"
                 @click="${i=>{this.executingAction=e,t.action.execute(i.currentTarget).then(async()=>this.closeNotification())}}"
                 class="${a.classMap({executing:this.executingAction===e,disabled:this.executingAction>=0&&this.executingAction!==e})}"
                >${t.label}</a>
            `)}
          </div>
        `}
      </div>
    `}};__decorate([s.property({type:String})],l.prototype,"notificationId",void 0),__decorate([s.property({type:String})],l.prototype,"title",void 0),__decorate([s.property({type:String})],l.prototype,"message",void 0),__decorate([s.property({type:String})],l.prototype,"icon",void 0),__decorate([s.property({type:String})],l.prototype,"className",void 0),__decorate([s.property({type:Boolean})],l.prototype,"visible",void 0),__decorate([s.property({type:Number})],l.prototype,"executingAction",void 0),__decorate([s.property({type:Array})],l.prototype,"actions",void 0),l=__decorate([s.customElement("typo3-notification-message")],l);try{parent&&parent.window.TYPO3&&parent.window.TYPO3.Notification&&(c=parent.window.TYPO3.Notification),top&&top.TYPO3.Notification&&(c=top.TYPO3.Notification)}catch(t){}return c||(c=n,"undefined"!=typeof TYPO3&&(TYPO3.Notification=c)),c}));