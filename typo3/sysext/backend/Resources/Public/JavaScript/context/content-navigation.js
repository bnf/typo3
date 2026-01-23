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
import{createContext as l}from"@lit/context";import"@typo3/backend/context/context-root.js";class c{constructor(t,o,n,i,a,s,e,h){this.collapsed=t,this.hidden=o,this.shouldShowCollapseButton=n,this.shouldShowExpandButton=i,this.navigationLabelCollapse=a,this.navigationLabelExpand=s,this.focusTarget=e,this.toggle=h}}const p=l("typo3-content-navigation");export{c as ContentNavigationContext,p as contentNavigationContext};
