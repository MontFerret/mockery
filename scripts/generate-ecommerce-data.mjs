import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'src/data');

const brands = [
  'Northwind',
  'Contoso',
  'Fabrikam',
  'Blue Yonder',
  'Tailspin',
  'Adventure Works',
  'Litware',
  'Alpine Goods',
  'Pixel Forge',
  'Cedar & Co.',
];

const categories = [
  {
    id: 'laptops',
    name: 'Laptops',
    description: 'Portable computers for work and entertainment.',
    code: 'LAP',
    count: 8,
    basePrice: 899,
    specSets: [
      { Memory: '16 GB', Storage: '512 GB SSD', Display: '14 inch' },
      { Memory: '32 GB', Storage: '1 TB SSD', Display: '16 inch', Processor: '8-core' },
      { Memory: '8 GB', Storage: '256 GB SSD', Weight: '1.3 kg' },
    ],
  },
  {
    id: 'phones',
    name: 'Phones',
    description: 'Mobile devices with stable fake plans and accessories.',
    code: 'PHN',
    count: 8,
    basePrice: 449,
    specSets: [
      { Storage: '128 GB', Camera: '48 MP', Battery: '4200 mAh' },
      { Storage: '256 GB', Display: '6.4 inch', Network: '5G' },
      { Storage: '64 GB', Color: 'Graphite', Warranty: '1 year' },
    ],
  },
  {
    id: 'headphones',
    name: 'Headphones',
    description: 'Audio gear for travel, work, and gaming setups.',
    code: 'AUD',
    count: 7,
    basePrice: 79,
    specSets: [
      { Type: 'Over-ear', Battery: '32 hours', Connectivity: 'Bluetooth' },
      { Type: 'In-ear', Drivers: '10 mm', WaterResistance: 'IPX4' },
      { Type: 'Open-back', Cable: 'Detachable', Impedance: '32 ohm' },
    ],
  },
  {
    id: 'cameras',
    name: 'Cameras',
    description: 'Photo and video equipment with varied specs.',
    code: 'CAM',
    count: 7,
    basePrice: 299,
    specSets: [
      { Sensor: 'APS-C', LensMount: 'MCK-X', Video: '4K' },
      { Sensor: '1 inch', Zoom: '12x', Stabilization: 'Optical' },
      { Resolution: '24 MP', Lens: '35 mm equivalent', Weight: '410 g' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Countertop appliances and cooking tools.',
    code: 'KIT',
    count: 7,
    basePrice: 39,
    specSets: [
      { Capacity: '5 L', Material: 'Stainless steel', Power: '900 W' },
      { Capacity: '1.7 L', Finish: 'Matte white', AutoOff: 'Yes' },
      { Pieces: '8', DishwasherSafe: 'Yes', Material: 'Ceramic' },
    ],
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Fictional books for metadata and text extraction examples.',
    code: 'BOK',
    count: 7,
    basePrice: 12,
    specSets: [
      { Format: 'Paperback', Pages: '320', Language: 'English' },
      { Format: 'Hardcover', Pages: '448', Edition: 'Second' },
      { Format: 'Ebook', FileType: 'EPUB', License: 'Personal' },
    ],
  },
  {
    id: 'office',
    name: 'Office',
    description: 'Desk accessories, printers, and productivity hardware.',
    code: 'OFF',
    count: 7,
    basePrice: 29,
    specSets: [
      { Material: 'Aluminum', Dimensions: '60 x 30 cm', Color: 'Silver' },
      { Connectivity: 'USB-C', Ports: '7', CableLength: '1 m' },
      { PaperSize: 'A4', TrayCapacity: '250 sheets', Duplex: 'Manual' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Consoles, controllers, and streaming accessories.',
    code: 'GMG',
    count: 7,
    basePrice: 59,
    specSets: [
      { Platform: 'PC', PollingRate: '1000 Hz', Lighting: 'RGB' },
      { Platform: 'Console', Storage: '1 TB', Controllers: '2' },
      { Capture: '1080p60', Interface: 'USB-C', Latency: 'Low' },
    ],
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    description: 'Connected devices for fake home automation demos.',
    code: 'SMH',
    count: 7,
    basePrice: 34,
    specSets: [
      { Protocol: 'Matter', Power: 'Battery', HubRequired: 'No' },
      { Protocol: 'Wi-Fi', VoiceControl: 'Yes', Zones: '4' },
      { Protocol: 'Zigbee', Range: '30 m', Sensors: 'Temperature' },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'Wearables and home training equipment.',
    code: 'FIT',
    count: 7,
    basePrice: 24,
    specSets: [
      { Size: 'Medium', Material: 'Silicone', WaterResistance: '5 ATM' },
      { Weight: '12 kg', Material: 'Rubber', Pair: 'Yes' },
      { Resistance: 'Adjustable', Levels: '16', Foldable: 'Yes' },
    ],
  },
];

const titleTemplates = {
  laptops: ['Laptop Pro 14', 'Laptop Pro 14 Refurbished', 'Laptop Air 13', 'Laptop Studio 16', 'Laptop Mini 11', 'Laptop Developer Workstation with Ultra-Wide Dock Bundle', 'Laptop Pro 14 Plus', 'Laptop Flex 2-in-1'],
  phones: ['Phone X1', 'Phone X1 Mini', 'Phone Max 6', 'Phone Max 6 Case Bundle', 'Phone Lite 5G', 'Phone Camera Edition', 'Phone SE Duplicate Name', 'Phone SE Duplicate Name Plus'],
  headphones: ['Noise Canceling Headphones', 'Studio Headphones', 'Travel Earbuds', 'Gaming Headset', 'Open-Back Monitor Headphones', 'Kids Volume-Limited Headphones', 'Headphones USB-C Edition'],
  cameras: ['Mirrorless Camera Kit', 'Pocket Camera 12x', 'Action Camera Waterproof', 'Camera Lens 35mm', 'Video Creator Camera', 'Instant Camera Classic', 'Camera Tripod Bundle'],
  kitchen: ['Smart Kettle', 'Countertop Blender', 'Ceramic Cookware Set', 'Pour-Over Coffee Scale', 'Compact Air Fryer', 'Chef Knife 8 Inch', 'Kitchen Storage Starter Set'],
  books: ['Practical Web Scraping', 'Book: Data Pipelines & Scraping Special Edition', 'The Static Site Handbook', 'Pagination Patterns', 'Reliable Selectors Guide', 'JSON APIs for Test Fixtures', 'Long-Tail Catalog Design'],
  office: ['Desk Lamp', 'USB-C Dock', 'Thermal Label Printer', 'Notebook Set', 'Ergonomic Mouse', 'Office Chair with Adjustable Lumbar Support and Breathable Mesh Back', 'Cable Organizer Kit'],
  gaming: ['Mechanical Keyboard', 'Wireless Controller', 'Gaming Console ++ Tournament Ready', 'Streaming Capture Card', 'RGB Mouse Pad XL', 'Arcade Stick Pro', 'Game Storage Tower'],
  'smart-home': ['Smart Bulb Pack', 'Door Sensor', 'Thermostat Mini', 'Security Camera Indoor', 'Voice Remote', 'Smart Plug Duo', 'Water Leak Sensor'],
  fitness: ['Fitness Tracker', 'Adjustable Dumbbell', 'Yoga Mat Pro', 'Resistance Band Set', 'Folding Exercise Bike', 'Smart Scale', 'Recovery Massage Roller'],
};

const tagTemplates = {
  laptops: ['portable', 'developer', 'work'],
  phones: ['mobile', 'camera', 'travel'],
  headphones: ['audio', 'wireless', 'commute'],
  cameras: ['photo', 'video', 'creator'],
  kitchen: ['home', 'cooking', 'countertop'],
  books: ['reading', 'reference', 'learning'],
  office: ['desk', 'productivity', 'work'],
  gaming: ['gaming', 'streaming', 'rgb'],
  'smart-home': ['automation', 'sensor', 'connected'],
  fitness: ['training', 'wellness', 'home-gym'],
};

const descriptions = {
  laptops: 'A deterministic fake laptop for scraping product titles, prices, and specifications.',
  phones: 'A fictional mobile device with stable catalog metadata and stock signals.',
  headphones: 'A mock audio product with predictable ratings, prices, and availability.',
  cameras: 'A fake camera product for image, spec, and review extraction examples.',
  kitchen: 'A fictional kitchen item with realistic product metadata and simple specs.',
  books: 'A pretend book entry useful for title, author-like text, and category examples.',
  office: 'A deterministic office product for catalog and detail-page scraping demos.',
  gaming: 'A mock gaming accessory with varied labels, tags, and product metadata.',
  'smart-home': 'A fake connected-home device for stable static web playground examples.',
  fitness: 'A fictional fitness product with predictable tags, stock, and specs.',
};

const reviewAuthors = ['Alice Reed', 'Noah Patel', 'Mina Carter', 'Jon Bell', 'Sofia Chen', 'Evan Brooks', 'Priya Stone', 'Leo Grant'];
const reviewTitles = ['Great product', 'Solid choice', 'Useful for demos', 'Stable and predictable', 'Matched the description'];
const reviewBodies = [
  'Fast, quiet, and lightweight.',
  'The metadata was easy to compare across the catalog.',
  'Worked exactly as expected in this fake storefront.',
  'A good deterministic item for examples and tests.',
  'The specs and price were clear on the detail page.',
];

const roundPrice = (value) => Number(value.toFixed(2));
const sequencePrice = (category, index, globalIndex) => roundPrice(category.basePrice + index * 37 + (globalIndex % 5) * 8.49 + 0.99);
const makeSlug = (title) =>
  title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+\+/g, 'plus-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const products = [];
let globalIndex = 1;

for (const category of categories) {
  for (let index = 1; index <= category.count; index += 1) {
    const title = titleTemplates[category.id][index - 1];
    const slug = index === 1 && category.id === 'laptops' ? 'laptop-pro-14' : makeSlug(title);
    const isCanonicalProduct = slug === 'laptop-pro-14';
    const price = isCanonicalProduct ? 1299 : sequencePrice(category, index, globalIndex);
    const hasOldPrice = globalIndex % 3 === 0 || isCanonicalProduct;
    const rating = isCanonicalProduct ? 4.7 : globalIndex % 7 === 0 ? null : Number((3.4 + (globalIndex % 14) * 0.1).toFixed(1));
    const outOfStock = globalIndex % 9 === 0;
    const stockCount = outOfStock ? 0 : ((globalIndex * 7) % 42) + 3;
    let tags = [...tagTemplates[category.id], index % 2 === 0 ? 'featured' : 'classic'];

    if (globalIndex === 12 || globalIndex === 42) {
      tags = [];
    }

    if (globalIndex === 6) {
      tags = ['portable', 'developer', 'work', 'dock', 'bundle', 'creator', 'long-title'];
    }

    products.push({
      id: slug,
      slug,
      sku: `MCK-${category.code}-${String(globalIndex).padStart(3, '0')}`,
      title,
      brand: brands[(globalIndex - 1) % brands.length],
      category: category.id,
      price,
      oldPrice: isCanonicalProduct ? 1499 : hasOldPrice ? roundPrice(price + 80 + (index % 4) * 40) : null,
      currency: 'USD',
      rating,
      reviewCount: isCanonicalProduct ? 128 : rating === null ? 0 : 18 + ((globalIndex * 11) % 180),
      inStock: !outOfStock,
      stockCount: isCanonicalProduct ? 14 : stockCount,
      description: isCanonicalProduct
        ? 'A lightweight laptop for developers and creators.'
        : `${descriptions[category.id]} Item ${index} in ${category.name.toLowerCase()} uses fake but stable data.`,
      tags,
      specs: isCanonicalProduct
        ? { Memory: '16 GB', Storage: '512 GB SSD', Display: '14 inch' }
        : {
            ...category.specSets[(index - 1) % category.specSets.length],
            SKUFamily: category.code,
          },
      image: `assets/images/products/${slug}.svg`,
    });

    globalIndex += 1;
  }
}

const reviewedProductIds = new Set(products.filter((_, index) => index % 3 !== 2).map((product) => product.id));
reviewedProductIds.add('laptop-pro-14');
reviewedProductIds.delete('phone-max-6');
reviewedProductIds.delete('reliable-selectors-guide');

for (const product of products) {
  if (!reviewedProductIds.has(product.id)) {
    product.rating = null;
    product.reviewCount = 0;
  }
}

const reviews = {};

for (const [productIndex, product] of products.entries()) {
  if (!reviewedProductIds.has(product.id)) {
    continue;
  }

  const count = product.id === 'laptop-pro-14' ? 3 : (productIndex % 2) + 1;
  reviews[product.id] = Array.from({ length: count }, (_, index) => {
    const author = reviewAuthors[(productIndex + index) % reviewAuthors.length];
    const isCanonicalReview = product.id === 'laptop-pro-14' && index === 0;
    const month = isCanonicalReview ? '04' : String(((productIndex + index) % 5) + 1).padStart(2, '0');
    const day = isCanonicalReview ? '12' : String(10 + ((productIndex + index * 3) % 18)).padStart(2, '0');

    return {
      id: `review-${product.id}-${String(index + 1).padStart(3, '0')}`,
      productId: product.id,
      title: isCanonicalReview ? 'Great laptop' : reviewTitles[(productIndex + index) % reviewTitles.length],
      author,
      date: `2026-${month}-${day}`,
      stars: isCanonicalReview ? 5 : 3 + ((productIndex + index) % 3),
      body: isCanonicalReview ? 'Fast, quiet, and lightweight.' : reviewBodies[(productIndex + index) % reviewBodies.length],
    };
  });
}

await fs.writeFile(path.join(dataDir, 'categories.json'), `${JSON.stringify(categories.map(({ code, count, basePrice, specSets, ...category }) => category), null, 2)}\n`);
await fs.writeFile(path.join(dataDir, 'products.json'), `${JSON.stringify(products, null, 2)}\n`);
await fs.writeFile(path.join(dataDir, 'reviews.json'), `${JSON.stringify(reviews, null, 2)}\n`);
