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
import module from"module";let ckeditorPromise=null;function loadScript(o){return new Promise((e,r)=>{const t=document.createElement("script");t.async=!0,t.onerror=r,t.onload=o=>e(o),t.src=o,document.head.appendChild(t)})}export function loadCKEditor(){if(null===ckeditorPromise){const o=module.uri.replace(/\/[^\/]+\.js/,"/Contrib/ckeditor.js");ckeditorPromise=loadScript(o).then(()=>window.CKEDITOR)}return ckeditorPromise}