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
!function(){function t(t,n,o,e){return t+=e,e>0&&t>o?t=n+(t-o-1):e<0&&t<n&&(t=o-(n-t-1)),String.fromCharCode(t)}function n(t,n,o){document.addEventListener(t,(function(t){for(let e=t.target;e;e=e.parentNode!==document?e.parentNode:null)if("matches"in e){const a=e;a.matches(n)&&o(t,a)}}))}n("click","a[data-mailto-token][data-mailto-vector]",(function(n,o){n.preventDefault();const e=o.dataset,a=e.mailtoToken,c=-1*parseInt(e.mailtoVector,10);document.location.href=function(n,o){let e="";for(let a=0;a<n.length;a++){const c=n.charCodeAt(a);e+=c>=43&&c<=58?t(c,43,58,o):c>=64&&c<=90?t(c,64,90,o):c>=97&&c<=122?t(c,97,122,o):n.charAt(a)}return e}(a,c)})),n("click","a[data-window-url]",(function(t,n){t.preventDefault();const o=n.dataset;!function(t,n,o){const e=window.open(t,n,o);e&&e.focus()}(o.windowUrl,o.windowTarget||null,o.windowFeatures||null)}))}();