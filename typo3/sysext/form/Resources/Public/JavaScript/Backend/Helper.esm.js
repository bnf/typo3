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
export class Helper{static dispatchFormEditor(e,r){require([e.app,e.mediator,e.viewModel],(e,t,a)=>{window.TYPO3.FORMEDITOR_APP=e.getInstance(r,t,a).run()})}static dispatchFormManager(e,r){require([e.app,e.viewModel],(e,t)=>{window.TYPO3.FORMMANAGER_APP=e.getInstance(r,t).run()})}}