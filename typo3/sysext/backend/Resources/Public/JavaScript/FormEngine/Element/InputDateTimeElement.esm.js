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
import DocumentService from"TYPO3/CMS/Core/DocumentService.esm.js";import FormEngineValidation from"TYPO3/CMS/Backend/FormEngineValidation.esm.js";import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent.esm.js";class InputDateTimeElement{constructor(e){this.element=null,DocumentService.ready().then(()=>{this.element=document.getElementById(e),this.registerEventHandler(this.element),import("TYPO3/CMS/Backend/DateTimePicker.esm.js").then(({default:e})=>{e.initialize(this.element)})})}registerEventHandler(e){new RegularEvent("formengine.dp.change",e=>{FormEngineValidation.validateField(e.target),FormEngineValidation.markFieldAsChanged(e.target),document.querySelectorAll(".module-docheader-bar .btn").forEach(e=>{e.classList.remove("disabled"),e.disabled=!1})}).bindTo(e)}}export default InputDateTimeElement;