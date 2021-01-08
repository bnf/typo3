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
var __decorate=this&&this.__decorate||function(t,e,s,o){var a,l=arguments.length,c=l<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,s):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,s,o);else for(var r=t.length-1;r>=0;r--)(a=t[r])&&(c=(l<3?a(c):l>3?a(e,s,c):a(e,s))||c);return l>3&&c&&Object.defineProperty(e,s,c),c};define(["require","exports","lit-element"],(function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.ConfigurationModule=void 0;let o=class extends s.LitElement{static get styles(){return s.css`
      :host {
        display: block;
        height: 100%;
      }
    `}createRenderRoot(){return this}render(){return s.html`
      FOO

<div class="module " data-module-id="" data-module-name="">


        <div class="module-loading-indicator"></div>
<div class="module-docheader t3js-module-docheader" style="height: auto;">
    <div class="module-docheader-bar module-docheader-bar-navigation t3js-module-docheader-bar t3js-module-docheader-bar-navigation row" style="height: auto;">




                    <div class="module-docheader-bar-column-left col">
                        <div class="row-cols-auto row">

                                <div class="col">

     <select class="form-select form-select-sm t3-js-jumpMenuBox" name="WebFuncJumpMenu" data-menu-identifier="web-func-jump-menu" data-global-event="change" data-action-navigate="$value">

            <option value="/typo3/module/system/reports?token=cf41f8f6643a6c0c35d4dd1ed06589038547b007&amp;action=index">Overview</option>

            <option value="/typo3/module/system/reports?token=cf41f8f6643a6c0c35d4dd1ed06589038547b007&amp;action=detail&amp;extension=tx_reports&amp;report=status" selected="selected">Status Report</option>

            <option value="/typo3/module/system/reports?token=cf41f8f6643a6c0c35d4dd1ed06589038547b007&amp;action=detail&amp;extension=sv&amp;report=services">Installed Services</option>

    </select>


                                </div>

                        </div>
                    </div>


        <div class="module-docheader-bar-column-right col-12 col-sm-9 text-right">

        </div>
    </div>
    <div class="module-docheader-bar module-docheader-bar-buttons t3js-module-docheader-bar t3js-module-docheader-bar-buttons" style="height: auto;">
        <div class="module-docheader-bar-column-left">
            <div class="btn-toolbar" role="toolbar" aria-label="">

</div>

        </div>
        <div class="module-docheader-bar-column-right">
            <div class="btn-toolbar" role="toolbar" aria-label="">


                <a href="#" class="btn btn-default btn-sm" onclick="top.TYPO3.ShortcutMenu.createShortcut('system_reports', '{\u0022action\u0022:\u0022detail\u0022,\u0022extension\u0022:\u0022tx_reports\u0022,\u0022report\u0022:\u0022status\u0022}', 'Status\u0020Report', 'Create\u0020a\u0020bookmark\u0020to\u0020this\u0020page', this);return false;" title="Create a bookmark to this page"><span class="t3js-icon icon icon-size-small icon-state-default icon-actions-system-shortcut-new" data-identifier="actions-system-shortcut-new">
	<span class="icon-markup">
<svg class="icon-color" role="img"><use xlink:href="/typo3/sysext/core/Resources/Public/Icons/T3Icons/sprites/actions.svg#actions-star"></use></svg>
	</span>

</span></a>


</div>

        </div>
    </div>
</div>


    <div class="module-body t3js-module-body" style="padding-top: 89px;">



    <h1>Reports</h1>


            <p class="lead">Here you can find a short overview of your site's parameters as well as any problems detected with your installation. It may be useful to copy and paste this information into support requests filed on TYPO3's support mailinglists and project issue trackers.</p><h2>TYPO3 System</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="notice col-6">TYPO3</td>
				<td class="notice col-6">11.1.0-dev<br>This version of TYPO3 seems to be a development version. Thus no update information exists.</td>
			</tr>

			<tr>
				<td class="warning col-6">Remaining updates</td>
				<td class="warning col-6">Update Incomplete<br>This installation is not configured for the TYPO3 version it is running. If you did so intentionally, this message can be safely ignored. If you are unsure, visit the Update Wizard section of the <a href="/typo3/module/tools/toolsupgrade?token=fa3f87d2c608e78a40dfaacc6a4960022612e0c9">Install Tool</a> to see how TYPO3 would change.</td>
			</tr>

			<tr>
				<td class="success col-6">File System</td>
				<td class="success col-6">Writable<br></td>
			</tr>

			<tr>
				<td class="success col-6">XCLASS used</td>
				<td class="success col-6">None<br></td>
			</tr>
		</tbody></table><h2>System</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="warning col-6">System environment check</td>
				<td class="warning col-6">1 Test(s)<br>The system environment check returned warnings. Those warnings might have a negative effect on the functionality and stability of your TYPO3 CMS instance. Please check the install tool "System environment" for all details.</td>
			</tr>

			<tr>
				<td class="success col-6">PHP Modules</td>
				<td class="success col-6">All required modules are installed.<br></td>
			</tr>

			<tr>
				<td class="success col-6">System environment check</td>
				<td class="success col-6">45 Test(s)<br></td>
			</tr>

			<tr>
				<td class="info col-6">System environment check</td>
				<td class="info col-6">2 Test(s)<br></td>
			</tr>
		</tbody></table><h2>Security</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="danger col-6">Exception Handler / Error Reporting</td>
				<td class="danger col-6">Insecure<br>Debug Exception Handler enabled in Production Context - will show full error messages including stack traces.</td>
			</tr>

			<tr>
				<td class="danger col-6">Trusted Hosts Pattern</td>
				<td class="danger col-6">Insecure<br>The trusted hosts pattern check is disabled. Please define the allowed hosts in the [SYS][trustedHostsPattern] section of the Install Tool.</td>
			</tr>

			<tr>
				<td class="warning col-6">Encrypted backend connection (HTTPS)</td>
				<td class="warning col-6">Insecure<br>Your backend access is not secured using HTTPS but relies on HTTP which sends all your data (including login passwords) over an insecure connection. All modern web sites should rely on HTTPS and only sites secured differently, for instance some intranet installations may use HTTP only.</td>
			</tr>

			<tr>
				<td class="warning col-6">Install Tool</td>
				<td class="warning col-6">Enabled permanently<br>The Install Tool is permanently enabled. Delete the file "<code style="white-space: nowrap;">/home/ben/src/TYPO3.CMS/typo3conf/ENABLE_INSTALL_TOOL</code>" when you have finished setting up TYPO3. <a href="http://t3core.localhost/typo3/module/system/reports?token=cf41f8f6643a6c0c35d4dd1ed06589038547b007&amp;action=detail&amp;extension=tx_reports&amp;report=status&amp;redirect=1&amp;adminCmd=remove_ENABLE_INSTALL_TOOL">Click to remove the file now!</a></td>
			</tr>

			<tr>
				<td class="warning col-6">Server Response on static files</td>
				<td class="warning col-6">Warnings<br><p><a href="https://docs.typo3.org/c/typo3/cms-core/master/en-us/Changelog/9.5.x/Feature-91354-IntegrateServerResponseSecurityChecks.html" rel="noreferrer" target="_blank">Please see documentation for further details...</a></p><ul><li><p>http://t3core.localhost/fileadmin/b93688eb.tmp/13f7f8e8.html<br>missing Content-Security-Policy for this location</p></li><li><p>http://t3core.localhost/fileadmin/b93688eb.tmp/13f7f8e8.svg<br>missing Content-Security-Policy for this location</p></li></ul></td>
			</tr>

			<tr>
				<td class="success col-6">.htaccess Upload Protection</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Admin User Account</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">File Deny Pattern</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Install Tool Password</td>
				<td class="success col-6">OK<br></td>
			</tr>
		</tbody></table><h2>Configuration</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="success col-6">MySQL Database Character Set</td>
				<td class="success col-6">OK<br>Your default database uses utf-8. All good.</td>
			</tr>

			<tr>
				<td class="success col-6">Permissions of created directories</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Permissions of created files</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Reference Index</td>
				<td class="success col-6">OK<br></td>
			</tr>
		</tbody></table><h2>Extension Manager</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="success col-6">Outdated status of existing, but not loaded extensions</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Outdated status of loaded extensions</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Security status of existing, but not loaded extensions</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="success col-6">Security status of loaded extensions</td>
				<td class="success col-6">OK<br></td>
			</tr>

			<tr>
				<td class="notice col-6">Update status of typo3.org main repository extension list</td>
				<td class="notice col-6">Extension list is not up to date!<br>The Main Repository extension list is older than 7 days. Please update it in the Extension manager or Scheduler.</td>
			</tr>
		</tbody></table><h2>File Abstraction Layer</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="success col-6">Files flagged as missing</td>
				<td class="success col-6">None<br></td>
			</tr>
		</tbody></table><h2>Redirects</h2><table class="table table-striped table-hover"><tbody>
			<tr>
				<td class="success col-6">Conflicting Redirects</td>
				<td class="success col-6">None<br>




</td>
			</tr>
		</tbody></table>



    </div>

</div>




    `}firstUpdated(){const t="/typo3/module/system/config?token=dummy",e=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:t,module:"system_config"}});console.log("sending out an url change "+t),this.dispatchEvent(e)}};o=__decorate([s.customElement("typo3-lowlevel-configuration-module")],o),e.ConfigurationModule=o}));