class MockeryRating extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    const value = this.getAttribute('value') || '4.5';
    root.innerHTML = `<style>:host{display:block;font-weight:600}</style><span data-testid="shadow-rating">Rating: ${value}</span>`;
  }
}

class MockeryProductCard extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    const title = this.getAttribute('title') || 'Shadow Product';
    root.innerHTML = `<article><h3 data-testid="shadow-title">${title}</h3><mockery-rating value="4.8"></mockery-rating></article>`;
  }
}

class MockeryHiddenDetails extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<details><summary data-testid="shadow-summary">Open hidden details</summary><p data-testid="shadow-details">This text lives in open shadow DOM.</p></details>`;
  }
}

customElements.define('mockery-rating', MockeryRating);
customElements.define('mockery-product-card', MockeryProductCard);
customElements.define('mockery-hidden-details', MockeryHiddenDetails);
