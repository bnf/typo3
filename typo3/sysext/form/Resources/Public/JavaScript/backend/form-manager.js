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
function t(t,e,o){if("function"==typeof t&&(t=!1!==t()),!t){if(e=e||"Assertion failed",o&&(e=e+" ("+o+")"),"undefined"!=typeof Error)throw new Error(e);throw e}}class e{constructor(t,e){this.isRunning=!1,this.configuration=t,this.viewModel=e}assert(e,o,i){t(e,o,i)}getPrototypes(){return Array.isArray(this.configuration.selectablePrototypesConfiguration)?this.configuration.selectablePrototypesConfiguration.map((t=>({label:t.label,value:t.identifier}))):[]}getTemplatesForPrototype(e){if(t("string"==typeof e,'Invalid parameter "prototypeName"',1475945286),!Array.isArray(this.configuration.selectablePrototypesConfiguration))return[];const o=[];return this.configuration.selectablePrototypesConfiguration.forEach((t=>{Array.isArray(t.newFormTemplates)&&t.identifier===e&&t.newFormTemplates.forEach((t=>{o.push({label:t.label,value:t.templatePath})}))})),o}getAccessibleFormStorageFolders(){return Array.isArray(this.configuration.accessibleFormStorageFolders)?this.configuration.accessibleFormStorageFolders.map((t=>({label:t.label,value:t.value}))):[]}getAjaxEndpoint(e){return t(void 0!==this.configuration.endpoints[e],"Endpoint "+e+" does not exist",1477506508),this.configuration.endpoints[e]}run(){if(this.isRunning)throw"You can not run the app twice (1475942618)";return this.bootstrap(),this.isRunning=!0,this}viewSetup(){t("function"==typeof this.viewModel.bootstrap,'The view model does not implement the method "bootstrap"',1475942906),this.viewModel.bootstrap(this)}bootstrap(){this.configuration=this.configuration||{},t("object"==typeof this.configuration.endpoints,'Invalid parameter "endpoints"',1477506504),this.viewSetup()}}let o=null;function i(t,i){return null===o&&(o=new e(t,i)),o}export{e as FormManager,t as assert,i as getInstance};