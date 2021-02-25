define(["exports","./lit-html","./directive","./directive-helpers"],(function(t,e,i,s){"use strict";
/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const n=(t,e)=>{const i=t.R;if(void 0===i)return!1;for(const t of i){var s;null!==(s=t.S)&&void 0!==s&&s.call(t,e,!1),n(t,e)}return!0},o=t=>{let e,i;do{var s;if(void 0===(e=t.Q))break;i=e.R,i.delete(t),t=e}while(0===(null===(s=i)||void 0===s?void 0:s.size))},h=t=>{for(let e;e=t.Q;t=e){let i=e.R;if(void 0===i)e.R=i=new Set;else if(i.has(t))break;i.add(t),l(e)}};function r(t){void 0!==this.R?(o(this),this.Q=t,h(this)):this.Q=t}function c(t,e=!1,i=0){const s=this.L,h=this.R;if(void 0!==h&&0!==h.size)if(e)if(Array.isArray(s))for(let t=i;t<s.length;t++)n(s[t],!1),o(s[t]);else null!=s&&(n(s,!1),o(s));else n(this,t)}const l=t=>{var e,s,n,o;t.type==i.PartType.CHILD&&(null!==(e=(n=t).T)&&void 0!==e||(n.T=c),null!==(s=(o=t).U)&&void 0!==s||(o.U=r))};class d extends i.Directive{constructor(t){super(t),this.isConnected=!0,this.xt=e.noChange,this.R=void 0,this.Q=t.Q,h(this)}S(t,e=!0){this.Tt(t),e&&(n(this,t),o(this))}Tt(t){var i,s;t!==this.isConnected&&(t?(this.isConnected=!0,this.xt!==e.noChange&&(this.setValue(this.xt),this.xt=e.noChange),null===(i=this.reconnected)||void 0===i||i.call(this)):(this.isConnected=!1,null===(s=this.disconnected)||void 0===s||s.call(this)))}W(t,e){if(!this.isConnected)throw Error(`AsyncDirective ${this.constructor.name} was rendered while its tree was disconnected.`);return super.W(t,e)}setValue(t){if(this.isConnected)if(s.isSingleExpression(this.Σbt))this.Σbt.M(t,this);else{const e=[...this.Σbt.L];e[this.Σgt]=t,this.Σbt.M(e,this,0)}else this.xt=t}disconnected(){}reconnected(){}}t.directive=i.directive,t.AsyncDirective=d,Object.defineProperty(t,"__esModule",{value:!0})}));
