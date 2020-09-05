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
/**
 * Module TYPO3/CMS/Extensionmanager/DistributionImage
 *
 * @example
 * <typo3-extensionmanager-distribution-image image="some/image.jpg" fallback="/some/fallback/image.jpg"/>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class DistribuitionImage extends HTMLElement {
    constructor() {
        super(...arguments);
        this.onError = () => {
            if (this.fallback.length) {
                this.imageElement.setAttribute('src', this.fallback);
            }
        };
    }
    connectedCallback() {
        this.image = this.getAttribute('image') || '';
        this.fallback = this.getAttribute('fallback') || '';
        if (!this.image.length && !this.fallback.length) {
            return;
        }
        this.attachShadow({ mode: 'open' });
        this.imageElement = document.createElement('img');
        const alt = this.getAttribute('alt') || '';
        if (alt.length) {
            this.imageElement.setAttribute('alt', alt);
        }
        const title = this.getAttribute('title') || '';
        if (title.length) {
            this.imageElement.setAttribute('title', title);
        }
        if (this.image.length) {
            this.imageElement.addEventListener('error', this.onError);
            this.imageElement.setAttribute('src', this.image);
        }
        else {
            this.imageElement.setAttribute('src', this.fallback);
        }
        const style = document.createElement('style');
        style.textContent = `
      img {
        display: block;
        width: 300px;
        height: auto;
      }
    `;
        this.shadowRoot.append(this.imageElement, style);
    }
    disconnectedCallback() {
        if (this.image.length && this.imageElement !== null) {
            this.imageElement.removeEventListener('error', this.onError);
        }
    }
}
window.customElements.define('typo3-extensionmanager-distribution-image', DistribuitionImage);

export { DistribuitionImage };
