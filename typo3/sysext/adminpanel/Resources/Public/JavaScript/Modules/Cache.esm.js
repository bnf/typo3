"use strict";
var TYPO3;
(function (TYPO3) {
    class Cache {
        constructor() {
            this.buttons = document.querySelectorAll('[data-typo3-role="clearCacheButton"]');
            this.buttons.forEach((element) => {
                element.addEventListener('click', () => {
                    let url = element.dataset.typo3AjaxUrl;
                    let request = new XMLHttpRequest();
                    request.open('GET', url);
                    request.send();
                    request.onload = () => {
                        location.reload();
                    };
                });
            });
        }
    }
    TYPO3.Cache = Cache;
})(TYPO3 || (TYPO3 = {}));
(() => {
    window.addEventListener('load', () => new TYPO3.Cache(), false);
})();
