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
import{SeverityEnum}from"@typo3/backend/enum/severity.js";import $ from"jquery";import{Carousel}from"bootstrap";import Modal from"@typo3/backend/modal.js";import Severity from"@typo3/backend/severity.js";import Icons from"@typo3/backend/icons.js";import{topLevelModuleImport}from"@typo3/backend/utility/top-level-module-import.js";class MultiStepWizard{constructor(){this.setup={slides:[],settings:{},forceSelection:!0,$carousel:null,carousel:null},this.originalSetup=$.extend(!0,{},this.setup)}set(e,t){return this.setup.settings[e]=t,this}addSlide(e,t,s="",i=SeverityEnum.notice,r,n){const a={identifier:e,title:t,content:s,severity:i,progressBarTitle:r,callback:n};return this.setup.slides.push(a),this}async addFinalProcessingSlide(e){e||(e=()=>{this.dismiss()});const t=await Icons.getIcon("spinner-circle",Icons.sizes.large,null,null),s=document.createElement("div");s.classList.add("text-center"),s.append(document.createRange().createContextualFragment(t)),this.addSlide("final-processing-slide",top.TYPO3.lang["wizard.processing.title"],s,Severity.notice,top.TYPO3.lang["wizard.progressStep.finish"],e)}show(){const e=this.generateSlides(),t=this.setup.slides[0];Modal.advanced({title:t.title,content:e,severity:t.severity,buttons:[{text:top.TYPO3.lang["wizard.button.cancel"],active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{this.getComponent().trigger("wizard-dismiss")}},{text:top.TYPO3.lang["wizard.button.prev"],btnClass:"btn-"+Severity.getCssClass(t.severity),name:"prev"},{text:top.TYPO3.lang["wizard.button.next"],btnClass:"btn-"+Severity.getCssClass(t.severity),name:"next"}],additionalCssClasses:["dialog-multi-step-wizard"],callback:e=>{topLevelModuleImport("@typo3/backend/element/progress-tracker-element.js").then((()=>{this.setup.carousel=new Carousel(e.querySelector(".carousel")),this.addProgressBar(),this.initializeEvents()}))}}),this.getComponent().on("wizard-visible",(()=>{this.setup.forceSelection&&(this.lockPrevStep(),this.lockNextStep()),this.runSlideCallback(t,this.setup.$carousel.find(".carousel-item").first())})).on("wizard-dismissed",(()=>{this.setup=$.extend(!0,{},this.originalSetup)}))}getComponent(){return null===this.setup.$carousel&&this.generateSlides(),this.setup.$carousel}dismiss(){Modal.dismiss()}lockNextStep(){const e=this.setup.$carousel.closest(".t3js-modal").find('button[name="next"]');return e.prop("disabled",!0),e}next(){this.setup.carousel.next()}previous(){this.setup.carousel.prev()}unlockNextStep(){const e=this.setup.$carousel.closest(".t3js-modal").find('button[name="next"]');return e.prop("disabled",!1),e}lockPrevStep(){const e=this.setup.$carousel.closest(".t3js-modal").find('button[name="prev"]');return e.prop("disabled",!0),e}unlockPrevStep(){const e=this.setup.$carousel.closest(".t3js-modal").find('button[name="prev"]');return e.prop("disabled",!1),e}triggerStepButton(e){const t=this.setup.$carousel.closest(".t3js-modal").find('button[name="'+e+'"]');return t.length>0&&!0!==t.prop("disabled")&&t.get(0).click(),t}blurCancelStep(){const e=this.setup.$carousel.closest(".t3js-modal").find('button[name="cancel"]');return e.trigger("blur"),e}initializeEvents(){const e=this.setup.$carousel.closest(".t3js-modal");this.initializeSlideNextEvent(e),this.initializeSlidePrevEvent(e),this.setup.$carousel.get(0).addEventListener("slide.bs.carousel",(t=>{"left"===t.direction?this.nextSlideChanges(e):this.prevSlideChanges(e)})),this.setup.$carousel.get(0).addEventListener("slid.bs.carousel",(e=>{const t=this.setup.$carousel.data("currentIndex"),s=this.setup.slides[t];this.setup.forceSelection&&this.lockNextStep(),this.runSlideCallback(s,$(e.relatedTarget))}));const t=this.getComponent();t.on("wizard-dismiss",this.dismiss),t.trigger("wizard-visible"),Modal.currentModal.addEventListener("typo3-modal-hidden",(()=>{t.trigger("wizard-dismissed")}))}initializeSlideNextEvent(e){e.find(".t3js-modal-footer").find('button[name="next"]').off().on("click",(()=>{this.setup.carousel.next()}))}initializeSlidePrevEvent(e){e.find(".t3js-modal-footer").find('button[name="prev"]').off().on("click",(()=>{this.setup.carousel.prev()}))}nextSlideChanges(e){this.initializeSlideNextEvent(e);const t=e.find(".t3js-modal-title"),s=e.find(".t3js-modal-footer"),i=this.setup.$carousel.data("currentSlide")+1,r=this.setup.$carousel.data("currentIndex"),n=r+1;e.find(".carousel-item:eq("+n+")").empty().append(this.setup.slides[n].content),t.text(this.setup.slides[n].title),this.unlockPrevStep(),this.setup.$carousel.data("currentSlide",i),this.setup.$carousel.data("currentIndex",n);s.find("typo3-backend-progress-tracker").attr("active",n),this.updateCurrentSeverity(e,r,n)}prevSlideChanges(e){this.initializeSlidePrevEvent(e);const t=e.find(".t3js-modal-title"),s=e.find(".t3js-modal-footer"),i=s.find('button[name="next"]'),r=this.setup.$carousel.data("currentSlide")-1,n=this.setup.$carousel.data("currentIndex"),a=n-1;e.find(".carousel-item:eq("+a+")").empty().append(this.setup.slides[a].content),t.text(this.setup.slides[a].title),a>0?this.unlockPrevStep():this.lockPrevStep(),this.setup.$carousel.data("currentSlide",r),this.setup.$carousel.data("currentIndex",a),i.text(top.TYPO3.lang["wizard.button.next"]);s.find("typo3-backend-progress-tracker").attr("active",a),this.updateCurrentSeverity(e,n,a)}updateCurrentSeverity(e,t,s){e.find(".t3js-modal-footer").find('button[name="next"]').removeClass("btn-"+Severity.getCssClass(this.setup.slides[t].severity)).addClass("btn-"+Severity.getCssClass(this.setup.slides[s].severity)),e.removeClass("dialog-severity-"+Severity.getCssClass(this.setup.slides[t].severity)).addClass("dialog-severity-"+Severity.getCssClass(this.setup.slides[s].severity))}runSlideCallback(e,t){"function"==typeof e.callback&&e.callback(t,this.setup.settings,e.identifier)}addProgressBar(){const e=this.setup.$carousel.find(".carousel-item").length,t=Math.max(1,e),s=Math.round(100/t),i=this.setup.$carousel.closest(".t3js-modal").find(".t3js-modal-footer");if(this.setup.$carousel.data("initialStep",s).data("slideCount",t).data("realSlideCount",e).data("currentIndex",0).data("currentSlide",1),t>1){const e=document.createElement("typo3-backend-progress-tracker");e.stages=this.setup.slides.map((e=>e.progressBarTitle)),i.prepend(e)}}generateSlides(){if(null!==this.setup.$carousel)return this.setup.$carousel;const e=document.createElement("div");e.classList.add("carousel","slide"),e.dataset.bsRide="false";const t=document.createElement("div");t.classList.add("carousel-inner"),t.role="listbox",e.append(t);for(let e=0;e<this.setup.slides.length;++e){const s=this.setup.slides[e],i=document.createElement("div");"string"==typeof s.content?i.textContent=s.content:s.content instanceof $?i.replaceChildren(s.content.get(0)):i.replaceChildren(s.content);const r=document.createElement("div");r.classList.add("carousel-item"),r.dataset.bsSlide=s.identifier,r.dataset.step=e.toString(10),r.append(i),t.append(r)}return this.setup.$carousel=$(e),this.setup.$carousel.find(".carousel-item").first().addClass("active"),this.setup.$carousel}}let multistepWizardObject;try{window.opener&&window.opener.TYPO3&&window.opener.TYPO3.MultiStepWizard&&(multistepWizardObject=window.opener.TYPO3.MultiStepWizard),parent&&parent.window.TYPO3&&parent.window.TYPO3.MultiStepWizard&&(multistepWizardObject=parent.window.TYPO3.MultiStepWizard),top&&top.TYPO3&&top.TYPO3.MultiStepWizard&&(multistepWizardObject=top.TYPO3.MultiStepWizard)}catch{}multistepWizardObject||(multistepWizardObject=new MultiStepWizard,"undefined"!=typeof TYPO3&&(TYPO3.MultiStepWizard=multistepWizardObject));export default multistepWizardObject;