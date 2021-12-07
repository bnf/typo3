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
import ContentContainer from"./Viewport/ContentContainer";import ConsumerScope from"./Event/ConsumerScope";import Loader from"./Viewport/Loader";import NavigationContainer from"./Viewport/NavigationContainer";import Topbar from"./Viewport/Topbar";class Viewport{constructor(){this.Loader=Loader,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=ConsumerScope,this.Topbar=new Topbar,this.NavigationContainer=new NavigationContainer(this.consumerScope),this.ContentContainer=new ContentContainer(this.consumerScope)}}let viewportObject;top.TYPO3.Backend?viewportObject=top.TYPO3.Backend:(viewportObject=new Viewport,top.TYPO3.Backend=viewportObject);export default viewportObject;