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
import{loadModule as e}from"@typo3/core/java-script-item-processor.js";import t from"@typo3/core/document-service.js";export class Helper{static dispatchFormEditor(r,o){t.ready().then((()=>{Promise.all([e(r.app),e(r.mediator),e(r.viewModel)]).then((e=>((e,t,r)=>{window.TYPO3.FORMEDITOR_APP=e.getInstance(o,t,r).run()})(...e)))}))}static dispatchFormManager(r,o){t.ready().then((()=>{Promise.all([e(r.app),e(r.viewModel)]).then((e=>((e,t)=>{window.TYPO3.FORMMANAGER_APP=e.getInstance(o,t).run()})(...e)))}))}}