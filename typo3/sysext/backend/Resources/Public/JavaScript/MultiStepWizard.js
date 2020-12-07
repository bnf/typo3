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
define(["./Enum/Severity","jquery","./Modal","./Severity","./Icons"],(function(e,t,s,i,a){"use strict";class r{constructor(){this.setup={slides:[],settings:{},forceSelection:!0,$carousel:null},this.originalSetup=t.extend(!0,{},this.setup)}set(e,t){return this.setup.settings[e]=t,this}addSlide(t,s,i="",a=e.SeverityEnum.info,r,l){const n={identifier:t,title:s,content:i,severity:a,progressBarTitle:r,callback:l};return this.setup.slides.push(n),this}addFinalProcessingSlide(e){return e||(e=()=>{this.dismiss()}),a.getIcon("spinner-circle",a.sizes.default,null,null).then(s=>{let a=t("<div />",{class:"text-center"}).append(s);this.addSlide("final-processing-slide",top.TYPO3.lang["wizard.processing.title"],a[0].outerHTML,i.info,null,e)})}show(){let e=this.generateSlides(),a=this.setup.slides[0];s.confirm(a.title,e,a.severity,[{text:top.TYPO3.lang["wizard.button.cancel"],active:!0,btnClass:"btn-default pull-left",name:"cancel",trigger:()=>{this.getComponent().trigger("wizard-dismiss")}},{text:top.TYPO3.lang["wizard.button.prev"],btnClass:"btn-"+i.getCssClass(a.severity),name:"prev"},{text:top.TYPO3.lang["wizard.button.next"],btnClass:"btn-"+i.getCssClass(a.severity),name:"next"}],["modal-multi-step-wizard"]),this.addButtonContainer(),this.addProgressBar(),this.initializeEvents(),this.getComponent().on("wizard-visible",()=>{this.runSlideCallback(a,this.setup.$carousel.find(".carousel-item").first())}).on("wizard-dismissed",()=>{this.setup=t.extend(!0,{},this.originalSetup)})}getComponent(){return null===this.setup.$carousel&&this.generateSlides(),this.setup.$carousel}dismiss(){s.dismiss()}lockNextStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="next"]');return e.prop("disabled",!0),e}unlockNextStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="next"]');return e.prop("disabled",!1),e}lockPrevStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="prev"]');return e.prop("disabled",!0),e}unlockPrevStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="prev"]');return e.prop("disabled",!1),e}triggerStepButton(e){let t=this.setup.$carousel.closest(".modal").find('button[name="'+e+'"]');return t.length>0&&!0!==t.prop("disabled")&&t.trigger("click"),t}blurCancelStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="cancel"]');return e.trigger("blur"),e}initializeEvents(){let e=this.setup.$carousel.closest(".modal");this.initializeSlideNextEvent(e),this.initializeSlidePrevEvent(e),this.setup.$carousel.on("slide.bs.carousel",t=>{"left"===t.direction?this.nextSlideChanges(e):this.prevSlideChanges(e)}).on("slid.bs.carousel",e=>{let s=this.setup.$carousel.data("currentIndex"),i=this.setup.slides[s];this.runSlideCallback(i,t(e.relatedTarget)),this.setup.forceSelection&&this.lockNextStep()});let i=this.getComponent();i.on("wizard-dismiss",this.dismiss),s.currentModal.on("hidden.bs.modal",()=>{i.trigger("wizard-dismissed")}).on("shown.bs.modal",()=>{i.trigger("wizard-visible")})}initializeSlideNextEvent(e){e.find(".modal-footer").find('button[name="next"]').off().on("click",()=>{this.setup.$carousel.carousel("next")})}initializeSlidePrevEvent(e){e.find(".modal-footer").find('button[name="prev"]').off().on("click",()=>{this.setup.$carousel.carousel("prev")})}nextSlideChanges(e){this.initializeSlideNextEvent(e);const t=e.find(".modal-title"),s=e.find(".modal-footer"),i=this.setup.$carousel.data("currentSlide")+1,a=this.setup.$carousel.data("currentIndex"),r=a+1;t.text(this.setup.slides[r].title),this.setup.$carousel.data("currentSlide",i),this.setup.$carousel.data("currentIndex",r);const l=s.find(".progress-bar");l.eq(a).width("0%"),l.eq(r).width(this.setup.$carousel.data("initialStep")*i+"%").removeClass("inactive"),this.updateCurrentSeverity(e,a,r)}prevSlideChanges(e){this.initializeSlidePrevEvent(e);const t=e.find(".modal-title"),s=e.find(".modal-footer"),i=s.find('button[name="next"]'),a=this.setup.$carousel.data("currentSlide")-1,r=this.setup.$carousel.data("currentIndex"),l=r-1;this.setup.$carousel.data("currentSlide",a),this.setup.$carousel.data("currentIndex",l),t.text(this.setup.slides[l].title),s.find(".progress-bar.last-step").width(this.setup.$carousel.data("initialStep")+"%").text(this.getProgressBarTitle(this.setup.$carousel.data("slideCount")-1)),i.text(top.TYPO3.lang["wizard.button.next"]);const n=s.find(".progress-bar");n.eq(r).width(this.setup.$carousel.data("initialStep")+"%").addClass("inactive"),n.eq(l).width(this.setup.$carousel.data("initialStep")*a+"%").removeClass("inactive"),this.updateCurrentSeverity(e,r,l)}updateCurrentSeverity(e,t,s){e.find(".modal-footer").find('button[name="next"]').removeClass("btn-"+i.getCssClass(this.setup.slides[t].severity)).addClass("btn-"+i.getCssClass(this.setup.slides[s].severity)),e.removeClass("modal-severity-"+i.getCssClass(this.setup.slides[t].severity)).addClass("modal-severity-"+i.getCssClass(this.setup.slides[s].severity))}getProgressBarTitle(e){let t;return t=null===this.setup.slides[e].progressBarTitle?0===e?top.TYPO3.lang["wizard.progressStep.start"]:e>=this.setup.$carousel.data("slideCount")-1?top.TYPO3.lang["wizard.progressStep.finish"]:top.TYPO3.lang["wizard.progressStep"]+String(e+1):this.setup.slides[e].progressBarTitle,t}runSlideCallback(e,t){"function"==typeof e.callback&&e.callback(t,this.setup.settings,e.identifier)}addProgressBar(){let e,s=this.setup.$carousel.find(".carousel-item").length,i=Math.max(1,s),a=this.setup.$carousel.closest(".modal").find(".modal-footer");if(e=Math.round(100/i),this.setup.$carousel.data("initialStep",e).data("slideCount",i).data("realSlideCount",s).data("currentIndex",0).data("currentSlide",1),i>1){a.prepend(t("<div />",{class:"progress"}));for(let s=0;s<this.setup.slides.length;++s){let i;i=0===s?"progress-bar first-step":s===this.setup.$carousel.data("slideCount")-1?"progress-bar last-step inactive":"progress-bar step inactive",a.find(".progress").append(t("<div />",{role:"progressbar",class:i,"aria-valuemin":0,"aria-valuenow":e,"aria-valuemax":100}).width(e+"%").text(this.getProgressBarTitle(s)))}}}addButtonContainer(){this.setup.$carousel.closest(".modal").find(".modal-footer .btn").wrapAll('<div class="modal-btn-group" />')}generateSlides(){if(null!==this.setup.$carousel)return this.setup.$carousel;let e='<div class="carousel slide" data-bs-ride="carousel" data-bs-interval="false"><div class="carousel-inner" role="listbox">';for(let t=0;t<this.setup.slides.length;++t){let s=this.setup.slides[t],i=s.content;"object"==typeof i&&(i=i.html()),e+='<div class="carousel-item" data-bs-slide="'+s.identifier+'" data-step="'+t+'">'+i+"</div>"}return e+="</div></div>",this.setup.$carousel=t(e),this.setup.$carousel.find(".carousel-item").first().addClass("active"),this.setup.$carousel}}let l;try{window.opener&&window.opener.TYPO3&&window.opener.TYPO3.MultiStepWizard&&(l=window.opener.TYPO3.MultiStepWizard),parent&&parent.window.TYPO3&&parent.window.TYPO3.MultiStepWizard&&(l=parent.window.TYPO3.MultiStepWizard),top&&top.TYPO3&&top.TYPO3.MultiStepWizard&&(l=top.TYPO3.MultiStepWizard)}catch(e){}return l||(l=new r,"undefined"!=typeof TYPO3&&(TYPO3.MultiStepWizard=l)),l}));