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
class a{loading=-3;notice=-2;info=-1;ok=0;warning=1;error=2;getCssClass(s){let e;switch(s){case this.loading:case this.notice:e="notice";break;case this.ok:e="success";break;case this.warning:e="warning";break;case this.error:e="danger";break;case this.info:default:e="info"}return e}}var i=new a;export{i as default};
