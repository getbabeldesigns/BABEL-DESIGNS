import monolithCollectionImg from '@/assets/monolith-collection.jpg';
import stillnessCollectionImg from '@/assets/stillness-collection.jpg';
import originCollectionImg from '@/assets/origin-collection.jpg';
import benchViolaHeroImg from '@/assets/bench-viola-hero.webp';
import heroBgImg from '@/assets/hero-bg.jpg';
import homepageBgImg from '@/assets/homepagebg.jpeg';
import philosophyHeroImg from '@/assets/philosophy-hero.jpg';

export interface Product {
  id: string;
  name: string;
  collection: string;
  collectionSlug: string;
  price: number;
  description: string;
  philosophy: string;
  materials: string[];
  dimensions: string;
  image: string;
  images: string[];
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export const collections: Collection[] = [
  {
    id: '1',
    slug: 'monolith',
    name: 'The Monolith Collection',
    tagline: 'Permanence in form',
    description:
      'Inspired by ancient stone monuments, each piece embodies weight, presence, and timeless stability. Crafted from solid materials that age gracefully.',
    image: monolithCollectionImg,
  },
  {
    id: '2',
    slug: 'stillness',
    name: 'The Stillness Collection',
    tagline: 'Quiet refinement',
    description:
      'Furniture designed for contemplation. Clean lines, soft curves, and materials that invite pause. A meditation on space and silence.',
    image: stillnessCollectionImg,
  },
  {
    id: '3',
    slug: 'origin',
    name: 'The Origin Series',
    tagline: 'Return to essence',
    description:
      'Stripped to fundamental forms, this collection celebrates raw materials in their most honest expression. Wood grain, stone texture, metal patina.',
    image: originCollectionImg,
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Monolith Console',
    collection: 'The Monolith Collection',
    collectionSlug: 'monolith',
    price: 4800,
    description: 'A commanding presence in any entrance. Solid travertine with hand-finished edges.',
    philosophy:
      'The console stands as a testament to permanence, a piece that grows more beautiful with each passing year.',
    materials: ['Italian Travertine', 'Bronze Hardware'],
    dimensions: 'W 160cm x D 45cm x H 85cm',
    image: monolithCollectionImg,
    images: [monolithCollectionImg, heroBgImg, philosophyHeroImg],
  },
  {
    id: '2',
    name: 'Monolith Dining Table',
    collection: 'The Monolith Collection',
    collectionSlug: 'monolith',
    price: 12500,
    description: 'Where gatherings become rituals. A singular slab of limestone on a blackened steel base.',
    philosophy: 'The dining table is the altar of the home, where stories are shared and bonds are strengthened.',
    materials: ['Portuguese Limestone', 'Blackened Steel'],
    dimensions: 'W 280cm x D 110cm x H 76cm',
    image: heroBgImg,
    images: [heroBgImg, monolithCollectionImg, homepageBgImg],
  },
  {
    id: '7',
    name: 'Monolith Accent Table',
    collection: 'The Monolith Collection',
    collectionSlug: 'monolith',
    price: 3600,
    description: 'A sculptural side table in dense stone and smoked metal, designed to anchor lounge settings.',
    philosophy: 'Weight and restraint create quiet authority in a room.',
    materials: ['Honed Basalt', 'Smoked Steel'],
    dimensions: 'W 70cm x D 70cm x H 42cm',
    image: homepageBgImg,
    images: [homepageBgImg, monolithCollectionImg, philosophyHeroImg],
  },
  {
    id: '8',
    name: 'Monolith Pedestal Unit',
    collection: 'The Monolith Collection',
    collectionSlug: 'monolith',
    price: 5200,
    description: 'A bold storage pedestal with carved stone faces and concealed compartments.',
    philosophy: 'Storage can be monumental without losing calm proportion.',
    materials: ['Sandblasted Limestone', 'Bronze Inlay'],
    dimensions: 'W 95cm x D 50cm x H 88cm',
    image: philosophyHeroImg,
    images: [philosophyHeroImg, monolithCollectionImg, heroBgImg],
  },
  {
    id: '3',
    name: 'Stillness Lounge Chair',
    collection: 'The Stillness Collection',
    collectionSlug: 'stillness',
    price: 3200,
    description: 'Designed for hours of quiet contemplation. Oak frame with natural linen upholstery.',
    philosophy: 'In stillness, we find ourselves. This chair invites moments of reflection and rest.',
    materials: ['White Oak', 'Belgian Linen', 'Horsehair Fill'],
    dimensions: 'W 78cm x D 85cm x H 72cm',
    image: stillnessCollectionImg,
    images: [stillnessCollectionImg, homepageBgImg, benchViolaHeroImg],
  },
  {
    id: '4',
    name: 'Stillness Daybed',
    collection: 'The Stillness Collection',
    collectionSlug: 'stillness',
    price: 5600,
    description: 'A sanctuary for rest. Solid walnut platform with organic cotton mattress.',
    philosophy: 'The daybed exists between waking and dreaming, a liminal space for restoration.',
    materials: ['American Walnut', 'Organic Cotton', 'Natural Latex'],
    dimensions: 'W 200cm x D 90cm x H 35cm',
    image: benchViolaHeroImg,
    images: [benchViolaHeroImg, stillnessCollectionImg, heroBgImg],
  },
  {
    id: '5',
    name: 'Origin Shelf System',
    collection: 'The Origin Series',
    collectionSlug: 'origin',
    price: 2800,
    description: 'Modular shelving that celebrates the beauty of raw materials. Blackened oak and patinated brass.',
    philosophy: 'Objects deserve a stage that honors their presence without competing for attention.',
    materials: ['Blackened Oak', 'Patinated Brass'],
    dimensions: 'W 180cm x D 35cm x H 200cm',
    image: originCollectionImg,
    images: [originCollectionImg, philosophyHeroImg, heroBgImg],
  },
  {
    id: '6',
    name: 'Origin Side Table',
    collection: 'The Origin Series',
    collectionSlug: 'origin',
    price: 1400,
    description: 'A study in essential form. Solid bronze with a hand-rubbed finish.',
    philosophy: 'The most profound design removes everything unnecessary, leaving only truth.',
    materials: ['Cast Bronze'],
    dimensions: 'Dia 45cm x H 50cm',
    image: heroBgImg,
    images: [heroBgImg, originCollectionImg, homepageBgImg],
  },
];

export const getProductsByCollection = (slug: string): Product[] => {
  return products.filter((p) => p.collectionSlug === slug);
};

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return collections.find((c) => c.slug === slug);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};
