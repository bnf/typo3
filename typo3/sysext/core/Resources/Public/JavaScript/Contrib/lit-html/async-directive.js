define(["exports","./lit-html","./directive","./directive-helpers"],(function(exports,litHtml,directive,directiveHelpers){"use strict";
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
   */const r=(t,i)=>{const s=t.R;if(void 0===s)return!1;for(const t of s){var _t$S;null!==(_t$S=t.S)&&void 0!==_t$S&&_t$S.call(t,i,!1),r(t,i)}return!0},h=t=>{let i,s;do{var _s;if(void 0===(i=t.Q))break;s=i.R,s.delete(t),t=i}while(0===(null===(_s=s)||void 0===_s?void 0:_s.size))},o=t=>{for(let i;i=t.Q;t=i){let s=i.R;if(void 0===s)i.R=s=new Set;else if(s.has(t))break;s.add(t),d(i)}};function n(t){void 0!==this.R?(h(this),this.Q=t,o(this)):this.Q=t}function c(t,i=!1,s=0){const e=this.L,o=this.R;if(void 0!==o&&0!==o.size)if(i)if(Array.isArray(e))for(let t=s;t<e.length;t++)r(e[t],!1),h(e[t]);else null!=e&&(r(e,!1),h(e));else r(this,t)}const d=t=>{var _i$T,_e$U,i,e;t.type==directive.PartType.CHILD&&(null!==(_i$T=(i=t).T)&&void 0!==_i$T||(i.T=c),null!==(_e$U=(e=t).U)&&void 0!==_e$U||(e.U=n))};class f extends directive.Directive{constructor(i){super(i),this.isConnected=!0,this.xt=litHtml.noChange,this.R=void 0,this.Q=i.Q,o(this)}S(t,i=!0){this.Tt(t),i&&(r(this,t),h(this))}Tt(i){var _this$reconnected,_this$disconnected;i!==this.isConnected&&(i?(this.isConnected=!0,this.xt!==litHtml.noChange&&(this.setValue(this.xt),this.xt=litHtml.noChange),null===(_this$reconnected=this.reconnected)||void 0===_this$reconnected||_this$reconnected.call(this)):(this.isConnected=!1,null===(_this$disconnected=this.disconnected)||void 0===_this$disconnected||_this$disconnected.call(this)))}W(t,i){if(!this.isConnected)throw Error(`AsyncDirective ${this.constructor.name} was rendered while its tree was disconnected.`);return super.W(t,i)}setValue(t){if(this.isConnected)if(directiveHelpers.isSingleExpression(this.Σbt))this.Σbt.M(t,this);else{const i=[...this.Σbt.L];i[this.Σgt]=t,this.Σbt.M(i,this,0)}else this.xt=t}disconnected(){}reconnected(){}}exports.directive=directive.directive,exports.AsyncDirective=f,Object.defineProperty(exports,"__esModule",{value:!0})}));
