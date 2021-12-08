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
class Md5{static hash(d){let M,t,e,r,n,a,o,i,s,H;for(d=Md5.utf8Encode(d),M=Md5.convertToWordArray(d),o=1732584193,i=4023233417,s=2562383102,H=271733878,t=0;t<M.length;t+=16)e=o,r=i,n=s,a=H,o=Md5.FF(o,i,s,H,M[t],7,3614090360),H=Md5.FF(H,o,i,s,M[t+1],12,3905402710),s=Md5.FF(s,H,o,i,M[t+2],17,606105819),i=Md5.FF(i,s,H,o,M[t+3],22,3250441966),o=Md5.FF(o,i,s,H,M[t+4],7,4118548399),H=Md5.FF(H,o,i,s,M[t+5],12,1200080426),s=Md5.FF(s,H,o,i,M[t+6],17,2821735955),i=Md5.FF(i,s,H,o,M[t+7],22,4249261313),o=Md5.FF(o,i,s,H,M[t+8],7,1770035416),H=Md5.FF(H,o,i,s,M[t+9],12,2336552879),s=Md5.FF(s,H,o,i,M[t+10],17,4294925233),i=Md5.FF(i,s,H,o,M[t+11],22,2304563134),o=Md5.FF(o,i,s,H,M[t+12],7,1804603682),H=Md5.FF(H,o,i,s,M[t+13],12,4254626195),s=Md5.FF(s,H,o,i,M[t+14],17,2792965006),i=Md5.FF(i,s,H,o,M[t+15],22,1236535329),o=Md5.GG(o,i,s,H,M[t+1],5,4129170786),H=Md5.GG(H,o,i,s,M[t+6],9,3225465664),s=Md5.GG(s,H,o,i,M[t+11],14,643717713),i=Md5.GG(i,s,H,o,M[t],20,3921069994),o=Md5.GG(o,i,s,H,M[t+5],5,3593408605),H=Md5.GG(H,o,i,s,M[t+10],9,38016083),s=Md5.GG(s,H,o,i,M[t+15],14,3634488961),i=Md5.GG(i,s,H,o,M[t+4],20,3889429448),o=Md5.GG(o,i,s,H,M[t+9],5,568446438),H=Md5.GG(H,o,i,s,M[t+14],9,3275163606),s=Md5.GG(s,H,o,i,M[t+3],14,4107603335),i=Md5.GG(i,s,H,o,M[t+8],20,1163531501),o=Md5.GG(o,i,s,H,M[t+13],5,2850285829),H=Md5.GG(H,o,i,s,M[t+2],9,4243563512),s=Md5.GG(s,H,o,i,M[t+7],14,1735328473),i=Md5.GG(i,s,H,o,M[t+12],20,2368359562),o=Md5.HH(o,i,s,H,M[t+5],4,4294588738),H=Md5.HH(H,o,i,s,M[t+8],11,2272392833),s=Md5.HH(s,H,o,i,M[t+11],16,1839030562),i=Md5.HH(i,s,H,o,M[t+14],23,4259657740),o=Md5.HH(o,i,s,H,M[t+1],4,2763975236),H=Md5.HH(H,o,i,s,M[t+4],11,1272893353),s=Md5.HH(s,H,o,i,M[t+7],16,4139469664),i=Md5.HH(i,s,H,o,M[t+10],23,3200236656),o=Md5.HH(o,i,s,H,M[t+13],4,681279174),H=Md5.HH(H,o,i,s,M[t],11,3936430074),s=Md5.HH(s,H,o,i,M[t+3],16,3572445317),i=Md5.HH(i,s,H,o,M[t+6],23,76029189),o=Md5.HH(o,i,s,H,M[t+9],4,3654602809),H=Md5.HH(H,o,i,s,M[t+12],11,3873151461),s=Md5.HH(s,H,o,i,M[t+15],16,530742520),i=Md5.HH(i,s,H,o,M[t+2],23,3299628645),o=Md5.II(o,i,s,H,M[t],6,4096336452),H=Md5.II(H,o,i,s,M[t+7],10,1126891415),s=Md5.II(s,H,o,i,M[t+14],15,2878612391),i=Md5.II(i,s,H,o,M[t+5],21,4237533241),o=Md5.II(o,i,s,H,M[t+12],6,1700485571),H=Md5.II(H,o,i,s,M[t+3],10,2399980690),s=Md5.II(s,H,o,i,M[t+10],15,4293915773),i=Md5.II(i,s,H,o,M[t+1],21,2240044497),o=Md5.II(o,i,s,H,M[t+8],6,1873313359),H=Md5.II(H,o,i,s,M[t+15],10,4264355552),s=Md5.II(s,H,o,i,M[t+6],15,2734768916),i=Md5.II(i,s,H,o,M[t+13],21,1309151649),o=Md5.II(o,i,s,H,M[t+4],6,4149444226),H=Md5.II(H,o,i,s,M[t+11],10,3174756917),s=Md5.II(s,H,o,i,M[t+2],15,718787259),i=Md5.II(i,s,H,o,M[t+9],21,3951481745),o=Md5.addUnsigned(o,e),i=Md5.addUnsigned(i,r),s=Md5.addUnsigned(s,n),H=Md5.addUnsigned(H,a);return(Md5.wordToHex(o)+Md5.wordToHex(i)+Md5.wordToHex(s)+Md5.wordToHex(H)).toLowerCase()}static rotateLeft(d,M){return d<<M|d>>>32-M}static addUnsigned(d,M){let t=2147483648&d,e=2147483648&M,r=1073741824&d,n=1073741824&M,a=(1073741823&d)+(1073741823&M);return r&n?2147483648^a^t^e:r|n?1073741824&a?3221225472^a^t^e:1073741824^a^t^e:a^t^e}static F(d,M,t){return d&M|~d&t}static G(d,M,t){return d&t|M&~t}static H(d,M,t){return d^M^t}static I(d,M,t){return M^(d|~t)}static FF(d,M,t,e,r,n,a){return d=Md5.addUnsigned(d,Md5.addUnsigned(Md5.addUnsigned(Md5.F(M,t,e),r),a)),Md5.addUnsigned(Md5.rotateLeft(d,n),M)}static GG(d,M,t,e,r,n,a){return d=Md5.addUnsigned(d,Md5.addUnsigned(Md5.addUnsigned(Md5.G(M,t,e),r),a)),Md5.addUnsigned(Md5.rotateLeft(d,n),M)}static HH(d,M,t,e,r,n,a){return d=Md5.addUnsigned(d,Md5.addUnsigned(Md5.addUnsigned(Md5.H(M,t,e),r),a)),Md5.addUnsigned(Md5.rotateLeft(d,n),M)}static II(d,M,t,e,r,n,a){return d=Md5.addUnsigned(d,Md5.addUnsigned(Md5.addUnsigned(Md5.I(M,t,e),r),a)),Md5.addUnsigned(Md5.rotateLeft(d,n),M)}static convertToWordArray(d){let M,t=d.length,e=t+8,r=16*((e-e%64)/64+1),n=Array(r-1),a=0,o=0;for(;o<t;)M=(o-o%4)/4,a=o%4*8,n[M]=n[M]|d.charCodeAt(o)<<a,o++;return M=(o-o%4)/4,a=o%4*8,n[M]=n[M]|128<<a,n[r-2]=t<<3,n[r-1]=t>>>29,n}static wordToHex(d){let M,t,e="",r="";for(t=0;t<=3;t++)M=d>>>8*t&255,r="0"+M.toString(16),e+=r.substr(r.length-2,2);return e}static utf8Encode(d){d=d.replace(/\r\n/g,"\n");let M="";for(let t=0;t<d.length;t++){let e=d.charCodeAt(t);e<128?M+=String.fromCharCode(e):e>127&&e<2048?(M+=String.fromCharCode(e>>6|192),M+=String.fromCharCode(63&e|128)):(M+=String.fromCharCode(e>>12|224),M+=String.fromCharCode(e>>6&63|128),M+=String.fromCharCode(63&e|128))}return M}}export default Md5;