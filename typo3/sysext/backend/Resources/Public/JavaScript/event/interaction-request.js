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
class e{constructor(e,parentRequest=null){this.processed=!1,this.processedData=null,this.type=e,this.parentRequest=parentRequest}get outerMostRequest(){let s=this
for(;s.parentRequest instanceof e;)s=s.parentRequest
return s}isProcessed(){return this.processed}getProcessedData(){return this.processedData}setProcessedData(processedData=null){this.processed=!0,this.processedData=processedData}}export default e
