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
define(["TYPO3/CMS/Backend/BackendException"],(function(e){"use strict";describe("TYPO3/CMS/Backend/BackendException",()=>{it("sets exception message",()=>{const s=new e("some message");expect(s.message).toBe("some message")}),it("sets exception code",()=>{const s=new e("",12345);expect(s.code).toBe(12345)})})}));