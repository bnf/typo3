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
define(["lit-element","lit-html/directives/class-map","lit-html/directives/if-defined","./Enum/Severity","./Severity"],(function(t,e,i,s,a){"use strict";var n=this&&this.__decorate||function(t,e,i,s){var a,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var r=t.length-1;r>=0;r--)(a=t[r])&&(o=(n<3?a(o):n>3?a(e,i,o):a(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o};class o{static notice(t,e,i,a){o.showMessage(t,e,s.SeverityEnum.notice,i,a)}static info(t,e,i,a){o.showMessage(t,e,s.SeverityEnum.info,i,a)}static success(t,e,i,a){o.showMessage(t,e,s.SeverityEnum.ok,i,a)}static warning(t,e,i,a){o.showMessage(t,e,s.SeverityEnum.warning,i,a)}static error(t,e,i=0,a){o.showMessage(t,e,s.SeverityEnum.error,i,a)}static showMessage(t,e,i=s.SeverityEnum.info,a=this.duration,n=[]){a=void 0===a?this.duration:a,null!==this.messageContainer&&null!==document.getElementById("alert-container")||(this.messageContainer=document.createElement("div"),this.messageContainer.setAttribute("id","alert-container"),document.body.appendChild(this.messageContainer));const o=document.createElement("typo3-notification-message");o.setAttribute("notificationId","notification-"+Math.random().toString(36).substr(2,5)),o.setAttribute("title",t),e&&o.setAttribute("message",e),o.setAttribute("severity",i.toString()),o.setAttribute("duration",a.toString()),o.actions=n,this.messageContainer.appendChild(o)}}o.duration=5,o.messageContainer=null;let r,c=class extends t.LitElement{constructor(){super(...arguments),this.severity=s.SeverityEnum.info,this.duration=0,this.actions=[],this.visible=!1,this.executingAction=-1}createRenderRoot(){return this}async firstUpdated(){await new Promise(t=>window.setTimeout(t,200)),this.visible=!0,await this.requestUpdate(),this.duration>0&&(await new Promise(t=>window.setTimeout(t,1e3*this.duration)),this.close())}async close(){this.visible=!1;const t=()=>{this.parentNode&&this.parentNode.removeChild(this)};"animate"in this?(this.style.overflow="hidden",this.style.display="block",this.animate([{height:this.getBoundingClientRect().height+"px"},{height:0}],{duration:400,easing:"cubic-bezier(.02, .01, .47, 1)"}).onfinish=t):t()}render(){const n=a.getCssClass(this.severity);let o="";switch(this.severity){case s.SeverityEnum.notice:o="lightbulb-o";break;case s.SeverityEnum.ok:o="check";break;case s.SeverityEnum.warning:o="exclamation";break;case s.SeverityEnum.error:o="times";break;case s.SeverityEnum.info:default:o="info"}return t.html`
      <div
        id="${i.ifDefined(this.notificationId||void 0)}"
        class="${"alert alert-"+n+" alert-dismissible fade"+(this.visible?" in":"")}"
        role="alert">
        <button type="button" class="close" @click="${async t=>this.close()}">
          <span aria-hidden="true"><i class="fa fa-times-circle"></i></span>
          <span class="sr-only">Close</span>
        </button>
        <div class="media">
          <div class="media-left">
            <span class="fa-stack fa-lg">
              <i class="fa fa-circle fa-stack-2x"></i>
              <i class="${"fa fa-"+o+" fa-stack-1x"}"></i>
            </span>
          </div>
          <div class="media-body">
            <h4 class="alert-title">${this.title}</h4>
            <p class="alert-message text-pre-wrap">${this.message?this.message:""}</p>
          </div>
        </div>
        ${0===this.actions.length?"":t.html`
          <div class="alert-actions">
            ${this.actions.map((i,s)=>t.html`
              <a href="#"
                 title="${i.label}"
                 @click="${async t=>{t.preventDefault(),this.executingAction=s,await this.updateComplete,await i.action.execute(t.currentTarget),this.close()}}"
                 class="${e.classMap({executing:this.executingAction===s,disabled:this.executingAction>=0&&this.executingAction!==s})}"
                >${i.label}</a>
            `)}
          </div>
        `}
      </div>
    `}};n([t.property()],c.prototype,"notificationId",void 0),n([t.property()],c.prototype,"title",void 0),n([t.property()],c.prototype,"message",void 0),n([t.property({type:Number})],c.prototype,"severity",void 0),n([t.property()],c.prototype,"duration",void 0),n([t.property({type:Array,attribute:!1})],c.prototype,"actions",void 0),n([t.internalProperty()],c.prototype,"visible",void 0),n([t.internalProperty()],c.prototype,"executingAction",void 0),c=n([t.customElement("typo3-notification-message")],c);try{parent&&parent.window.TYPO3&&parent.window.TYPO3.Notification&&(r=parent.window.TYPO3.Notification),top&&top.TYPO3.Notification&&(r=top.TYPO3.Notification)}catch(t){}return r||(r=o,"undefined"!=typeof TYPO3&&(TYPO3.Notification=r)),r}));