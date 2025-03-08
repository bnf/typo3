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
/*! Based on http://www.webtoolkit.info/javascript_md5.html */
class t{static hash(d){let e,r,n,a,o,s,i,H,F
d=t.utf8Encode(d)
const G=t.convertToWordArray(d)
for(s=1732584193,i=4023233417,H=2562383102,F=271733878,e=0;e<G.length;e+=16)r=s,n=i,a=H,o=F,s=t.FF(s,i,H,F,G[e],7,3614090360),F=t.FF(F,s,i,H,G[e+1],12,3905402710),H=t.FF(H,F,s,i,G[e+2],17,606105819),i=t.FF(i,H,F,s,G[e+3],22,3250441966),s=t.FF(s,i,H,F,G[e+4],7,4118548399),F=t.FF(F,s,i,H,G[e+5],12,1200080426),H=t.FF(H,F,s,i,G[e+6],17,2821735955),i=t.FF(i,H,F,s,G[e+7],22,4249261313),s=t.FF(s,i,H,F,G[e+8],7,1770035416),F=t.FF(F,s,i,H,G[e+9],12,2336552879),H=t.FF(H,F,s,i,G[e+10],17,4294925233),i=t.FF(i,H,F,s,G[e+11],22,2304563134),s=t.FF(s,i,H,F,G[e+12],7,1804603682),F=t.FF(F,s,i,H,G[e+13],12,4254626195),H=t.FF(H,F,s,i,G[e+14],17,2792965006),i=t.FF(i,H,F,s,G[e+15],22,1236535329),s=t.GG(s,i,H,F,G[e+1],5,4129170786),F=t.GG(F,s,i,H,G[e+6],9,3225465664),H=t.GG(H,F,s,i,G[e+11],14,643717713),i=t.GG(i,H,F,s,G[e],20,3921069994),s=t.GG(s,i,H,F,G[e+5],5,3593408605),F=t.GG(F,s,i,H,G[e+10],9,38016083),H=t.GG(H,F,s,i,G[e+15],14,3634488961),i=t.GG(i,H,F,s,G[e+4],20,3889429448),s=t.GG(s,i,H,F,G[e+9],5,568446438),F=t.GG(F,s,i,H,G[e+14],9,3275163606),H=t.GG(H,F,s,i,G[e+3],14,4107603335),i=t.GG(i,H,F,s,G[e+8],20,1163531501),s=t.GG(s,i,H,F,G[e+13],5,2850285829),F=t.GG(F,s,i,H,G[e+2],9,4243563512),H=t.GG(H,F,s,i,G[e+7],14,1735328473),i=t.GG(i,H,F,s,G[e+12],20,2368359562),s=t.HH(s,i,H,F,G[e+5],4,4294588738),F=t.HH(F,s,i,H,G[e+8],11,2272392833),H=t.HH(H,F,s,i,G[e+11],16,1839030562),i=t.HH(i,H,F,s,G[e+14],23,4259657740),s=t.HH(s,i,H,F,G[e+1],4,2763975236),F=t.HH(F,s,i,H,G[e+4],11,1272893353),H=t.HH(H,F,s,i,G[e+7],16,4139469664),i=t.HH(i,H,F,s,G[e+10],23,3200236656),s=t.HH(s,i,H,F,G[e+13],4,681279174),F=t.HH(F,s,i,H,G[e],11,3936430074),H=t.HH(H,F,s,i,G[e+3],16,3572445317),i=t.HH(i,H,F,s,G[e+6],23,76029189),s=t.HH(s,i,H,F,G[e+9],4,3654602809),F=t.HH(F,s,i,H,G[e+12],11,3873151461),H=t.HH(H,F,s,i,G[e+15],16,530742520),i=t.HH(i,H,F,s,G[e+2],23,3299628645),s=t.II(s,i,H,F,G[e],6,4096336452),F=t.II(F,s,i,H,G[e+7],10,1126891415),H=t.II(H,F,s,i,G[e+14],15,2878612391),i=t.II(i,H,F,s,G[e+5],21,4237533241),s=t.II(s,i,H,F,G[e+12],6,1700485571),F=t.II(F,s,i,H,G[e+3],10,2399980690),H=t.II(H,F,s,i,G[e+10],15,4293915773),i=t.II(i,H,F,s,G[e+1],21,2240044497),s=t.II(s,i,H,F,G[e+8],6,1873313359),F=t.II(F,s,i,H,G[e+15],10,4264355552),H=t.II(H,F,s,i,G[e+6],15,2734768916),i=t.II(i,H,F,s,G[e+13],21,1309151649),s=t.II(s,i,H,F,G[e+4],6,4149444226),F=t.II(F,s,i,H,G[e+11],10,3174756917),H=t.II(H,F,s,i,G[e+2],15,718787259),i=t.II(i,H,F,s,G[e+9],21,3951481745),s=t.addUnsigned(s,r),i=t.addUnsigned(i,n),H=t.addUnsigned(H,a),F=t.addUnsigned(F,o)
return(t.wordToHex(s)+t.wordToHex(i)+t.wordToHex(H)+t.wordToHex(F)).toLowerCase()}static rotateLeft(t,d){return t<<d|t>>>32-d}static addUnsigned(t,d){const e=2147483648&t,r=2147483648&d,n=1073741824&t,a=1073741824&d,o=(1073741823&t)+(1073741823&d)
return n&a?2147483648^o^e^r:n|a?1073741824&o?3221225472^o^e^r:1073741824^o^e^r:o^e^r}static F(t,d,e){return t&d|~t&e}static G(t,d,e){return t&e|d&~e}static H(t,d,e){return t^d^e}static I(t,d,e){return d^(t|~e)}static FF(d,e,r,n,a,o,s){return d=t.addUnsigned(d,t.addUnsigned(t.addUnsigned(t.F(e,r,n),a),s)),t.addUnsigned(t.rotateLeft(d,o),e)}static GG(d,e,r,n,a,o,s){return d=t.addUnsigned(d,t.addUnsigned(t.addUnsigned(t.G(e,r,n),a),s)),t.addUnsigned(t.rotateLeft(d,o),e)}static HH(d,e,r,n,a,o,s){return d=t.addUnsigned(d,t.addUnsigned(t.addUnsigned(t.H(e,r,n),a),s)),t.addUnsigned(t.rotateLeft(d,o),e)}static II(d,e,r,n,a,o,s){return d=t.addUnsigned(d,t.addUnsigned(t.addUnsigned(t.I(e,r,n),a),s)),t.addUnsigned(t.rotateLeft(d,o),e)}static convertToWordArray(t){let d
const e=t.length,r=e+8,n=16*((r-r%64)/64+1),a=Array(n-1)
let o=0,s=0
for(;s<e;)d=(s-s%4)/4,o=s%4*8,a[d]=a[d]|t.charCodeAt(s)<<o,s++
return d=(s-s%4)/4,o=s%4*8,a[d]=a[d]|128<<o,a[n-2]=e<<3,a[n-1]=e>>>29,a}static wordToHex(t){let d,e,r="",n=""
for(e=0;e<=3;e++)d=t>>>8*e&255,n="0"+d.toString(16),r+=n.substr(n.length-2,2)
return r}static utf8Encode(t){t=t.replace(/\r\n/g,"\n")
let d=""
for(let e=0;e<t.length;e++){const r=t.charCodeAt(e)
r<128?d+=String.fromCharCode(r):r>127&&r<2048?(d+=String.fromCharCode(r>>6|192),d+=String.fromCharCode(63&r|128)):(d+=String.fromCharCode(r>>12|224),d+=String.fromCharCode(r>>6&63|128),d+=String.fromCharCode(63&r|128))}return d}}export default t
