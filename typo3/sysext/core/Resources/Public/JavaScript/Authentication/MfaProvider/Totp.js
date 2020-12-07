define(["lit", "lit/decorators", "TYPO3/CMS/Backend/Modal"], function (a, b, Modal) {
  "use strict";
  var __decorate = this && this.__decorate || (function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  });
  var Selectors;
  (function (Selectors) {
    Selectors["modalBody"] = ".t3js-modal-body";
  })(Selectors || (Selectors = {}));
  let MfaTotpUrlButton = class MfaTotpUrlButton extends a.LitElement {
    constructor() {
      super();
      this.addEventListener("click", e => {
        e.preventDefault();
        this.showTotpAuthUrlModal();
      });
    }
    a.render() {
      return a.html`<slot></slot>`;
    }
    showTotpAuthUrlModal() {
      Modal.advanced({
        title: this.title,
        buttons: [{
          trigger: () => Modal.dismiss(),
          text: this.ok || "OK",
          active: true,
          btnClass: "btn-default",
          name: "ok"
        }],
        callback: currentModal => {
          a.render(a.html`
            <p>${this.description}</p>
            <pre>${this.url}</pre>
          `, currentModal[0].querySelector(Selectors.modalBody));
        }
      });
    }
  };
  __decorate([b.property({
    type: String
  })], MfaTotpUrlButton.prototype, "url", void 0);
  __decorate([b.property({
    type: String
  })], MfaTotpUrlButton.prototype, "title", void 0);
  __decorate([b.property({
    type: String
  })], MfaTotpUrlButton.prototype, "description", void 0);
  __decorate([b.property({
    type: String
  })], MfaTotpUrlButton.prototype, "ok", void 0);
  MfaTotpUrlButton = __decorate([b.customElement("typo3-mfa-totp-url-info-button")], MfaTotpUrlButton);
});
