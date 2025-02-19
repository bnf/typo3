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
import e from"@typo3/core/event/regular-event.js";export default new class{constructor(){const t=document.querySelector('form[data-on-submit="processNavigate"]');null!==t&&(new e("change",this.executeSubmit.bind(this)).delegateTo(document,'[data-on-change="submit"]'),new e("submit",this.processNavigate.bind(this)).bindTo(t))}executeSubmit(e){const t=e.target;(t instanceof HTMLSelectElement||t instanceof HTMLInputElement&&"checkbox"===t.type)&&t.form.submit()}processNavigate(e){const t=e.target;if(!(t instanceof HTMLFormElement))return;e.preventDefault();const n=t.elements.namedItem("paginator-target-page"),a=parseInt(n.dataset.numberOfPages,10);let o=n.dataset.url,s=parseInt(n.value,10);s>a?s=a:s<1&&(s=1),o=o.replace("987654322",s.toString()),self.location.href=o}};