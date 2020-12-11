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
var __decorate=this&&this.__decorate||function(e,t,i,s){var a,o=arguments.length,r=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(a=e[n])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","lit-element","lit-html/directives/class-map","./Enum/Severity","./Severity"],(function(e,t,i,s,a,o,r){"use strict";i=__importDefault(i);class n{static notice(e,t,i,s){n.showMessage(e,t,o.SeverityEnum.notice,i,s)}static info(e,t,i,s){n.showMessage(e,t,o.SeverityEnum.info,i,s)}static success(e,t,i,s){n.showMessage(e,t,o.SeverityEnum.ok,i,s)}static warning(e,t,i,s){n.showMessage(e,t,o.SeverityEnum.warning,i,s)}static error(e,t,i=0,s){n.showMessage(e,t,o.SeverityEnum.error,i,s)}static showMessage(e,t,s=o.SeverityEnum.info,a=this.duration,n=[]){const c=r.getCssClass(s);let l="";switch(s){case o.SeverityEnum.notice:l="lightbulb-o";break;case o.SeverityEnum.ok:l="check";break;case o.SeverityEnum.warning:l="exclamation";break;case o.SeverityEnum.error:l="times";break;case o.SeverityEnum.info:default:l="info"}a=void 0===a?this.duration:"string"==typeof a?parseFloat(a):a,null!==this.messageContainer&&null!==document.getElementById("alert-container")||(this.messageContainer=i.default("<div>",{id:"alert-container"}).appendTo("body"));const d=document.createElement("typo3-notification-message");d.setAttribute("notificationId","notification-"+Math.random().toString(36).substr(2,5)),d.setAttribute("className",c),d.setAttribute("title",e),t&&d.setAttribute("message",t),d.setAttribute("icon",l),d.actions=n;const p=i.default(d);p.on("close.bs.alert",e=>{e.preventDefault(),p.clearQueue().queue(e=>{d.removeAttribute("visible"),e()}).slideUp({complete:()=>{p.remove()}})}),p.appendTo(this.messageContainer),p.delay(200).queue(e=>{d.setAttribute("visible",""),e()}),a>0&&p.delay(1e3*a).queue(e=>{d.closeNotification(),e()})}}n.duration=5,n.messageContainer=null;let c,l=class extends s.LitElement{constructor(){super(...arguments),this.visible=!1,this.executingAction=-1,this.actions=[]}createRenderRoot(){return this}closeNotification(){const e=this.querySelector("#"+this.notificationId);e&&i.default.fn.alert?i.default(e).alert("close"):this.parentNode.removeChild(this)}render(){return s.html`
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
        ${this.actions.length>0?s.html`
          <div class="alert-actions">
            ${this.actions.map((e,t)=>s.html`
              <a href="#"
                 title="${e.label}"
                 @click="${i=>{this.executingAction=t,e.action.execute(i.currentTarget).then(()=>this.closeNotification())}}"
                 class="${a.classMap({executing:this.executingAction===t,disabled:this.executingAction>=0&&this.executingAction!==t})}"
                >${e.label}</a>
            `)}
          </div>
        `:""}
      </div>
    `}};__decorate([s.property({type:String})],l.prototype,"notificationId",void 0),__decorate([s.property({type:String})],l.prototype,"title",void 0),__decorate([s.property({type:String})],l.prototype,"message",void 0),__decorate([s.property({type:String})],l.prototype,"icon",void 0),__decorate([s.property({type:String})],l.prototype,"className",void 0),__decorate([s.property({type:Boolean})],l.prototype,"visible",void 0),__decorate([s.property({type:Number})],l.prototype,"executingAction",void 0),__decorate([s.property({type:Array})],l.prototype,"actions",void 0),l=__decorate([s.customElement("typo3-notification-message")],l);try{parent&&parent.window.TYPO3&&parent.window.TYPO3.Notification&&(c=parent.window.TYPO3.Notification),top&&top.TYPO3.Notification&&(c=top.TYPO3.Notification)}catch(e){}return c||(c=n,"undefined"!=typeof TYPO3&&(TYPO3.Notification=c)),c}));