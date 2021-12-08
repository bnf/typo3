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
import $ from"jquery";import FormEngine from"TYPO3/CMS/Backend/FormEngine";export class FormEngineInitializer{static initializeCKEditor(e){import("ckeditor").then(({default:i})=>{i.timestamp+="-"+e.configurationHash,e.externalPlugins.forEach(e=>i.plugins.addExternal(e.name,e.resource,"")),$(()=>{const n=e.fieldId,a="#"+$.escapeSelector(n);i.replace(n,e.configuration);const o=i.instances[n];o.on("change",e=>{let i=e.sender.commands;o.updateElement(),FormEngine.Validation.validateField($(a)),FormEngine.Validation.markFieldAsChanged($(a)),void 0!==i.maximize&&1===i.maximize.state&&o.on("maximize",e=>{$(this).off("maximize"),FormEngine.Validation.markFieldAsChanged($(a))})}),o.on("mode",e=>{if("source"===e.editor.mode){const e=o.editable();e.attachListener(e,"change",()=>{FormEngine.Validation.markFieldAsChanged($(a))})}}),document.addEventListener("inline:sorting-changed",()=>{o.destroy(),i.replace(n,e.configuration)}),document.addEventListener("formengine:flexform:sorting-changed",()=>{o.destroy(),i.replace(n,e.configuration)})})})}}