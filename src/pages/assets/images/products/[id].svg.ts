import { escapeXml, products, productSlug } from '../../../../lib/site.js';

export function getStaticPaths() {
  return products.map((product) => ({
    params: { id: productSlug(product) },
    props: { product },
  }));
}

export function GET({ props }) {
  const { product } = props;
  const title = escapeXml(product.title);
  const category = escapeXml(product.category);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" role="img" aria-label="${title}"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="28" fill="#0f172a">${title}</text><text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="18" fill="#334155">${category}</text></svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
}
