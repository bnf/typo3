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
class e{constructor(scopedHotkeyMap=new Map([["all",new Map]]),activeScope="all"){this.scopedHotkeyMap=scopedHotkeyMap,this.activeScope=activeScope}getScopedHotkeyMap(){return this.scopedHotkeyMap}}let t
top.TYPO3.HotkeyStorage?t=top.TYPO3.HotkeyStorage:(t=new e,top.TYPO3.HotkeyStorage=t)
export default t
