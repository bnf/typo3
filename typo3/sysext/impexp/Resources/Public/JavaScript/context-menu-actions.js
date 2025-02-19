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
export default new class{exportT3d(e,t,n){const p=n.actionUrl;"pages"===e?top.TYPO3.Backend.ContentContainer.setUrl(p+"&id="+t+"&tx_impexp[pagetree][id]="+t+"&tx_impexp[pagetree][levels]=0&tx_impexp[pagetree][tables][]=_ALL"):top.TYPO3.Backend.ContentContainer.setUrl(p+"&tx_impexp[record][]="+e+":"+t+"&tx_impexp[external_ref][tables][]=_ALL")}importT3d(e,t,n){const p=n.actionUrl;top.TYPO3.Backend.ContentContainer.setUrl(p+"&id="+t+"&table="+e)}};