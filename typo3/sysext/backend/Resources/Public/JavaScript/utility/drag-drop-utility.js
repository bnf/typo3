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
class t{static isCopyModifierFromEvent(t){return"copy"===t.dataTransfer.dropEffect||"move"!==t.dataTransfer.dropEffect&&(navigator.userAgent.includes("Mac")?"copy"===t.dataTransfer.effectAllowed||t.altKey:t.ctrlKey)}static updateEventAndTooltipToReflectCopyMoveIntention(e){const o=t.isCopyModifierFromEvent(e);e.dataTransfer.dropEffect=o?"copy":"move",top.document.dispatchEvent(new CustomEvent("typo3:drag-tooltip:metadata-update",{detail:{statusIconIdentifier:o?"actions-duplicate":"actions-move"}}))}}export{t as default};