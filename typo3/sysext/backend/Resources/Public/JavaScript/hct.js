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
import{argbFromHex as d,Hct as l,hexFromArgb as m,Blend as g}from"@material/material-color-utilities";const k="#000",y={blue:"#205eb5",purple:"#5e4db2",teal:"#abdced",green:"#247554",magenta:"#c6398f",yellow:"#fc3",orange:"#ee6d11",red:"#d13a2e"},S={primary:"#205eb5",secondary:"#737373",info:"#abdced",success:"#247554",warning:"#fc3",danger:"#d13a2e",notice:"#737373"},$=[0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,91,92,93,94,95,96,97,98,99,100],I=[3,4,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,96,97],h=[1,2,3,4,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,96,97,98,99],i=new CSSStyleSheet;document.adoptedStyleSheets.push(i);const b=()=>{const n={},{accent:c}=document.documentElement.dataset,f=c?d(c):null,u=f??d(k);for(const e of $){const t=l.fromInt(u);t.tone=100-e,t.chroma=Math.min(t.chroma/12,4);const o=`--token-color-neutral-${e}`;n[o]=m(t.toInt())}for(const[e,t]of Object.entries(S)){const o=d(t),r=c?g.harmonize(o,f):o;for(const a of h){const s=l.fromInt(r);s.tone=100-a;const p=`--token-color-${e}-${a}`;n[p]=m(s.toInt())}}for(const[e,t]of Object.entries(y)){const o=d(t);for(const r of I){const a=l.fromInt(o);a.tone=100-r;const s=`--token-color-${e}-${r}`;n[s]=m(a.toInt())}}if(c)for(const e of h){const t=l.fromInt(f);t.tone=100-e;const o=`--token-color-primary-${e}`;n[o]=m(t.toInt())}i.replaceSync(`
    @layer color {
      [data-theme=hct] {
        ${Object.entries(n).map(([e,t])=>`${e}: ${t}`).join(";")}
      }
      /* debug */
      html[data-theme=hct] .scaffold:after {
        content: 'HCT';
        display: block;
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 8px;
        background: var(--token-color-teal-10);
        color: var(--token-color-teal-90);
        z-index: 1000;
      }
    }
  `)};b();const x=new MutationObserver(n=>{n.forEach(c=>{c.type==="attributes"&&b()})});x.observe(document.documentElement,{attributeFilter:["data-accent"]});
