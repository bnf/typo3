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
import{ScaffoldIdentifierEnum as t}from"@typo3/backend/enum/viewport/scaffold-identifier.js";import e from"nprogress";export default class{static start(){e.configure({parent:t.contentModule,showSpinner:!1}),e.start()}static finish(){e.done()}}