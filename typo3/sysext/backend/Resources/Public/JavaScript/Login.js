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
define(["jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","bootstrap","TYPO3/CMS/Backend/Input/Clearable"],(function(e,o){"use strict";return new class{constructor(){this.ready=!0,this.options={error:".t3js-login-error",errorNoCookies:".t3js-login-error-nocookies",errorNoReferrer:".t3js-login-error-noreferrer",formFields:".t3js-login-formfields",interfaceField:".t3js-login-interface-field",loginForm:"#typo3-login-form",loginUrlLink:"t3js-login-url",submitButton:".t3js-login-submit",submitHandler:null,useridentField:".t3js-login-userident-field"},this.checkLoginRefresh(),this.checkCookieSupport(),this.checkForInterfaceCookie(),this.checkDocumentReferrerSupport(),this.initializeEvents(),top.location.href!==location.href&&(this.ready=!1,top.location.href=location.href),this.ready&&document.body.setAttribute("data-typo3-login-ready","true")}showLoginProcess(){this.showLoadingIndicator(),e(this.options.error).addClass("hidden"),e(this.options.errorNoCookies).addClass("hidden")}showLoadingIndicator(){const o=e(this.options.submitButton);o.html(o.data("loading-text"))}handleSubmit(e){this.showLoginProcess(),"function"==typeof this.options.submitHandler&&this.options.submitHandler(e)}interfaceSelectorChanged(){const o=new Date,i=new Date(o.getTime()+31536e6);document.cookie="typo3-login-interface="+e(this.options.interfaceField).val()+"; expires="+i.toUTCString()+";"}checkForInterfaceCookie(){if(e(this.options.interfaceField).length){const o=document.cookie.indexOf("typo3-login-interface=");if(-1!==o){let i=document.cookie.substr(o+22);i=i.substr(0,i.indexOf(";")),e(this.options.interfaceField).val(i)}}}checkDocumentReferrerSupport(){const e=document.getElementById(this.options.loginUrlLink);null!==e&&void 0===e.dataset.referrerCheckEnabled&&"1"!==e.dataset.referrerCheckEnabled||void 0!==TYPO3.settings&&void 0!==TYPO3.settings.ajaxUrls&&new o(TYPO3.settings.ajaxUrls.login_preflight).get().then(async e=>{!0!==(await e.resolve("application/json")).capabilities.referrer&&document.querySelectorAll(this.options.errorNoReferrer).forEach(e=>e.classList.remove("hidden"))})}showCookieWarning(){e(this.options.formFields).addClass("hidden"),e(this.options.errorNoCookies).removeClass("hidden")}hideCookieWarning(){e(this.options.formFields).removeClass("hidden"),e(this.options.errorNoCookies).addClass("hidden")}checkLoginRefresh(){const e=document.querySelector(this.options.loginForm+' input[name="loginRefresh"]');e instanceof HTMLInputElement&&e.value&&window.opener&&window.opener.TYPO3&&window.opener.TYPO3.LoginRefresh&&(window.opener.TYPO3.LoginRefresh.startTask(),window.close())}checkCookieSupport(){const e=navigator.cookieEnabled;!1===e?this.showCookieWarning():document.cookie||null!==e||(document.cookie="typo3-login-cookiecheck=1",document.cookie?document.cookie="typo3-login-cookiecheck=; expires="+new Date(0).toUTCString():this.showCookieWarning())}initializeEvents(){e(document).ajaxStart(this.showLoadingIndicator.bind(this)),e(this.options.loginForm).on("submit",this.handleSubmit.bind(this)),e(this.options.interfaceField).length>0&&e(document).on("change blur",this.options.interfaceField,this.interfaceSelectorChanged.bind(this)),document.querySelectorAll(".t3js-clearable").forEach(e=>e.clearable()),e(".t3js-login-news-carousel").on("slide.bs.carousel",o=>{const i=e(o.relatedTarget).height();e(o.target).find("div.active").parent().animate({height:i},500)})}}}));