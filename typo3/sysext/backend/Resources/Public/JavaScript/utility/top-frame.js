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
let topWindow=window,topTYPO3=window.TYPO3;try{window.opener&&"TYPO3"in window.opener&&(topWindow=window.opener),window.parent&&"TYPO3"in window.parent&&(topWindow=window.parent),window.top&&"TYPO3"in window.top&&(topWindow=window.top)}catch(o){}function getInstance(o,n,w=null){let t;return o in topTYPO3?t=topTYPO3[o]:(t=n(),topTYPO3[o]=t),window.TYPO3===topTYPO3||o in window.TYPO3||(window.TYPO3[o]=t,null!==w&&w(t)),t}topTYPO3="TYPO3"in topWindow&&"object"==typeof topWindow.TYPO3?topWindow.TYPO3:topWindow.TYPO3={};export{topWindow,topTYPO3,getInstance};