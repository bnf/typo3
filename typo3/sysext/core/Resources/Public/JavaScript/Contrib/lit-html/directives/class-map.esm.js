import { noChange as w } from '../lit-html.esm.js';
import { directive as i, Directive as s, PartType as t } from '../directive.esm.js';

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e=i(class extends s{constructor(t$1){var s;if(super(t$1),t$1.type!==t.ATTRIBUTE||"class"!==t$1.name||(null===(s=t$1.strings)||void 0===s?void 0:s.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).filter((s=>t[s])).join(" ")}update(s,[r]){if(void 0===this.bt){this.bt=new Set;for(const t in r)r[t]&&this.bt.add(t);return this.render(r)}const i=s.element.classList;this.bt.forEach((t=>{t in r||(i.remove(t),this.bt.delete(t));}));for(const t in r){const s=!!r[t];s!==this.bt.has(t)&&(s?(i.add(t),this.bt.add(t)):(i.remove(t),this.bt.delete(t)));}return w}});

export { e as classMap };
