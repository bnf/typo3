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
define(["TYPO3/CMS/Core/SecurityUtility"],(function(e){"use strict";describe("TYPO3/CMS/Core/SecurityUtility",()=>{it("generates random hex value",()=>{for(let t of function*(){yield 1,yield 20,yield 39}()){const i=(new e).getRandomHexValue(t);expect(i.length).toBe(t)}}),it("throws SyntaxError on invalid length",()=>{for(let t of function*(){yield 0,yield-90,yield 10.3}())expect(()=>(new e).getRandomHexValue(t)).toThrowError(SyntaxError)})})}));