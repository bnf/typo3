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
import $ from"jquery";import FormEngine from"TYPO3/CMS/Backend/FormEngine";let ckeditorPromise=null;function loadScript(e){return new Promise((i,n)=>{const o=document.createElement("script");o.async=!0,o.onerror=n,o.onload=e=>i(e),o.src=e,document.head.appendChild(o)})}function loadCKEditor(){if(null===ckeditorPromise){const e=import.meta.url.replace(/\/[^\/]+\.js/,"/Contrib/ckeditor.js");ckeditorPromise=loadScript(e).then(()=>window.CKEDITOR)}return ckeditorPromise}export class FormEngineInitializer{static initializeCKEditor(e){loadCKEditor().then(i=>{i.timestamp+="-"+e.configurationHash,e.externalPlugins.forEach(e=>i.plugins.addExternal(e.name,e.resource,"")),$(()=>{const n=e.fieldId,o="#"+$.escapeSelector(n);i.replace(n,e.configuration);const t=i.instances[n];t.on("change",e=>{let i=e.sender.commands;t.updateElement(),FormEngine.Validation.validateField($(o)),FormEngine.Validation.markFieldAsChanged($(o)),void 0!==i.maximize&&1===i.maximize.state&&t.on("maximize",e=>{$(this).off("maximize"),FormEngine.Validation.markFieldAsChanged($(o))})}),t.on("mode",e=>{if("source"===e.editor.mode){const e=t.editable();e.attachListener(e,"change",()=>{FormEngine.Validation.markFieldAsChanged($(o))})}}),document.addEventListener("inline:sorting-changed",()=>{t.destroy(),i.replace(n,e.configuration)}),document.addEventListener("formengine:flexform:sorting-changed",()=>{t.destroy(),i.replace(n,e.configuration)})})})}}