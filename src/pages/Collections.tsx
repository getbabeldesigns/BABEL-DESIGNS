import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AnimatedSection from '@/components/AnimatedSection';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { fetchCollections, fetchProducts } from '@/integrations/supabase/catalog';
import monolithImg from '@/assets/monolith-collection.jpg';
import stillnessImg from '@/assets/stillness-collection.jpg';
import originImg from '@/assets/origin-collection.jpg';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { formatINR } from '@/lib/currency';
import { getSafeImageSrc, handleImageError } from '@/lib/image';
import {
  buildSearchSuggestions,
  inferProductCategory,
  matchesSmartSearch,
  type SearchSuggestion,
} from '@/lib/smartSearch';

const Collections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceBand, setPriceBand] = useState<'all' | '0-3000' | '3001-7000' | '7001+'>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();

  const { data: collections = [], isLoading, isError } = useQuery({ queryKey: ['collections'], queryFn: fetchCollections });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    const material = (searchParams.get('material') || '').trim();
    const price = (searchParams.get('price') || '').trim() as 'all' | '0-3000' | '3001-7000' | '7001+';
    const collection = (searchParams.get('collection') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    if (q) setSearchTerm(q);
    if (material) setMaterialFilter(material);
    if (price && ['all', '0-3000', '3001-7000', '7001+'].includes(price)) setPriceBand(price);
    if (collection) setCollectionFilter(collection);
    if (category) setCategoryFilter(category);
  }, [searchParams]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => product.materials.forEach((material) => set.add(material)));
    return Array.from(set).sort();
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => set.add(inferProductCategory(product.name)));
    return Array.from(set).sort();
  }, [products]);

  const suggestions = useMemo(
    () =>
      buildSearchSuggestions({
        query: searchTerm,
        products,
        collections,
        materials,
        categories,
      }),
    [searchTerm, products, collections, materials, categories],
  );

  const filteredCollections = useMemo(() => {
    const query = searchTerm.trim();
    return collections.filter((collection) => {
      const matchesSearch =
        !query || matchesSmartSearch(query, `${collection.name} ${collection.tagline} ${collection.description}`);
      const matchesCollection = collectionFilter === 'all' || collection.slug === collectionFilter;
      return matchesSearch && matchesCollection;
    });
  }, [collections, searchTerm, collectionFilter]);

  const collectionImageBySlug = useMemo(
    () => new Map(collections.map((collection) => [collection.slug, collection.image])),
    [collections],
  );
  const localCollectionImageBySlug = useMemo(
    () =>
      new Map<string, string>([
        ['monolith', monolithImg],
        ['stillness', stillnessImg],
        ['origin', originImg],
      ]),
    [],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchTerm.trim();
      const category = inferProductCategory(product.name);
      const matchesSearch =
        !query ||
        matchesSmartSearch(
          query,
          `${product.name} ${product.description} ${product.materials.join(' ')} ${category} ${product.collection}`,
        );
      const matchesMaterial = materialFilter === 'all' || product.materials.includes(materialFilter);
      const matchesCollection = collectionFilter === 'all' || product.collectionSlug === collectionFilter;
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      const matchesPrice =
        priceBand === 'all' ||
        (priceBand === '0-3000' && product.price <= 3000) ||
        (priceBand === '3001-7000' && product.price >= 3001 && product.price <= 7000) ||
        (priceBand === '7001+' && product.price >= 7001);
      return matchesSearch && matchesMaterial && matchesCollection && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, materialFilter, collectionFilter, categoryFilter, priceBand]);

  const isFilterActive =
    searchTerm.trim().length > 0 ||
    materialFilter !== 'all' ||
    collectionFilter !== 'all' ||
    categoryFilter !== 'all' ||
    priceBand !== 'all';

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === 'material') {
      setMaterialFilter(suggestion.value);
      setSearchTerm(suggestion.label);
    } else if (suggestion.kind === 'collection') {
      setCollectionFilter(suggestion.value);
      setSearchTerm(suggestion.label);
    } else if (suggestion.kind === 'category') {
      setCategoryFilter(suggestion.value);
      setSearchTerm(suggestion.label);
    } else {
      setSearchTerm(suggestion.label);
    }
    setShowSuggestions(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0 section-transition">
          <div className="container-editorial">
            <div className="mb-12"><div className="mb-4 h-4 w-32 animate-pulse bg-muted" /><div className="h-12 w-80 animate-pulse bg-muted" /></div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-4"><div className="aspect-[4/3] animate-pulse bg-muted" /><div className="h-6 w-2/3 animate-pulse bg-muted" /><div className="h-4 w-full animate-pulse bg-muted" /></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0 section-transition">
          <div className="container-editorial text-center">
            <h1 className="font-serif text-3xl text-foreground mb-4">Unable to load collections</h1>
            <p className="font-sans text-muted-foreground">Please verify your Supabase configuration and try again.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0 section-transition">
        <div className="container-editorial">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Collections</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6">Concept-Driven Design</h1>
            <p className="font-sans text-muted-foreground max-w-2xl mx-auto leading-relaxed">Each collection represents a distinct philosophy - a meditation on material, form, and the spaces we inhabit. Not products, but ideas made tangible.</p>
          </motion.div>

          <div className="mb-8 grid grid-cols-1 gap-4 border border-border/60 bg-card/50 p-5 md:grid-cols-6">
            <div className="relative md:col-span-2">
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setShowSuggestions(true);
                  setActiveSuggestionIndex(0);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                onKeyDown={(event) => {
                  if (!suggestions.length || !showSuggestions) return;
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setActiveSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    const current = suggestions[activeSuggestionIndex];
                    if (current) selectSuggestion(current);
                  } else if (event.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Smart search products, materials, categories"
                className="w-full border border-border bg-background px-3 py-2 text-sm"
              />

              {showSuggestions && searchTerm.trim() && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto border border-border bg-background shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.kind}-${suggestion.value}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${index === activeSuggestionIndex ? 'bg-secondary/70' : 'hover:bg-secondary/50'}`}
                    >
                      <span className="truncate">{suggestion.label}</span>
                      <span className="ml-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{suggestion.kind}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)} title="Filter by collection" className="border border-border bg-background px-3 py-2 text-sm">
              <option value="all">All collections</option>
              {collections.map((collection) => (
                <option key={collection.slug} value={collection.slug}>
                  {collection.name}
                </option>
              ))}
            </select>
            <select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)} title="Filter by material" className="border border-border bg-background px-3 py-2 text-sm">
              <option value="all">All materials</option>
              {materials.map((material) => (<option key={material} value={material}>{material}</option>))}
            </select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} title="Filter by category" className="border border-border bg-background px-3 py-2 text-sm">
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select value={priceBand} onChange={(event) => setPriceBand(event.target.value as 'all' | '0-3000' | '3001-7000' | '7001+')} title="Filter by price" className="border border-border bg-background px-3 py-2 text-sm">
              <option value="all">All prices</option>
              <option value="0-3000">Up to INR 3,000</option>
              <option value="3001-7000">INR 3,001 - 7,000</option>
              <option value="7001+">INR 7,001+</option>
            </select>
          </div>

          {isFilterActive && (
            <section className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-serif text-3xl font-light">Filtered Results</h2>
                <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">{filteredProducts.length} results</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {filteredProducts.slice(0, 9).map((product) => (
                  <div key={product.id} className="border border-border bg-card/50 p-4">
                    <Link to={`/product/${product.id}`}><div className="mb-4 aspect-square overflow-hidden bg-secondary/30"><img src={getSafeImageSrc(localCollectionImageBySlug.get(product.collectionSlug), collectionImageBySlug.get(product.collectionSlug), product.image, ...(product.images ?? []), '/placeholder.svg')} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" onError={handleImageError} /></div></Link>
                    <p className="font-serif text-xl">{product.name}</p>
                    <p className="mb-2 text-sm text-muted-foreground">{product.materials.join(' / ')}</p>
                    <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{inferProductCategory(product.name)}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm uppercase tracking-[0.2em]">{formatINR(product.price)}</p>
                      <button onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image: getSafeImageSrc(localCollectionImageBySlug.get(product.collectionSlug), collectionImageBySlug.get(product.collectionSlug), product.image, ...(product.images ?? []), '/placeholder.svg'), material: product.materials[0] }); trackEvent({ event: 'add_to_cart', source: 'collections_discovery', product_id: product.id }); }} className="border border-foreground/30 px-3 py-2 text-xs uppercase tracking-[0.2em]">Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <motion.div variants={staggerContainerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-24 md:space-y-32">
            {filteredCollections.map((collection, index) => (
              <motion.div key={collection.slug} variants={staggerItemVariants}>
                <Link to={`/collections/${collection.slug}`} data-cursor="View" className={`group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center card-hover-lift ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <motion.div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}><motion.div className="aspect-[4/3] overflow-hidden relative border border-border/40"><img src={collection.image} alt={collection.name} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={handleImageError} /><div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" /></motion.div></motion.div>
                  <motion.div className={`${index % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}`} whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: index % 2 === 1 ? 40 : -40 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                    <motion.p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4" whileHover={{ y: -2, opacity: 0.85 }} transition={{ duration: 0.4 }}>{collection.tagline}</motion.p>
                    <motion.h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-6 group-hover:text-muted-foreground transition-colors" whileHover={{ scale: 1.02 }}>{collection.name}</motion.h2>
                    <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-md">{collection.description}</p>
                    <span className="mb-4 block h-px w-0 bg-foreground/40 transition-all duration-500 group-hover:w-24" />
                    <motion.span className="inline-block font-sans text-sm tracking-widest uppercase text-foreground border-b border-foreground/30 pb-2 group-hover:border-foreground transition-colors" whileHover={{ x: 4 }}>Explore Collection</motion.span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-28 md:mt-36">
            <div className="text-center mb-14">
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Studio Notes</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-6">Materials, Light, and Time</h2>
              <p className="font-sans text-muted-foreground max-w-2xl mx-auto leading-relaxed">Behind each collection is a quiet study of texture and proportion. These notes reflect the ongoing dialogue between raw material and refined form.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-secondary/40 border border-border/60 rounded-2xl overflow-hidden card-hover-lift"><div className="aspect-[4/3] overflow-hidden"><img src={monolithImg} alt="Stone study" className="w-full h-full object-cover" loading="lazy" decoding="async" onError={handleImageError} /></div><div className="p-6"><p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Stone Study</p><p className="font-sans text-muted-foreground leading-relaxed">Dense, grounded forms that anchor a room. A material that holds memory in its surface.</p></div></div>
              <div className="bg-secondary/40 border border-border/60 rounded-2xl overflow-hidden card-hover-lift"><div className="aspect-[4/3] overflow-hidden"><img src={stillnessImg} alt="Soft light" className="w-full h-full object-cover" loading="lazy" decoding="async" onError={handleImageError} /></div><div className="p-6"><p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Soft Light</p><p className="font-sans text-muted-foreground leading-relaxed">Linen, oak, and rounded edges invite the eye to linger. A calm rhythm for daily rituals.</p></div></div>
              <div className="bg-secondary/40 border border-border/60 rounded-2xl overflow-hidden card-hover-lift"><div className="aspect-[4/3] overflow-hidden"><img src={originImg} alt="Raw materials" className="w-full h-full object-cover" loading="lazy" decoding="async" onError={handleImageError} /></div><div className="p-6"><p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Raw Origin</p><p className="font-sans text-muted-foreground leading-relaxed">Unfinished textures, honest joinery, and the beauty of a material left to speak.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection className="pb-16 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">Need guidance?</p>
        <Link to="/consultancy" className="inline-flex border border-foreground/30 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">Book design consultancy</Link>
      </AnimatedSection>
    </div>
  );
};

export default Collections;
