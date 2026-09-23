import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from '@/lib/session';
import { getProductBySku } from '@/lib/ct/search';
import { getAttributeLabels } from '@/lib/ct/product-types';
import { getCategoryById } from '@/lib/ct/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Gallery from '@/components/product/Gallery';
import PriceDisplay from '@/components/product/PriceDisplay';
import VariantSelector from '@/components/product/VariantSelector';
import AddToCartButton from '@/components/product/AddToCartButton';
import AttributesTable from '@/components/product/AttributesTable';

// Memoized per-request so generateMetadata and the page component share one fetch instead of two.
const getProduct = cache(getProductBySku);

interface PageProps {
  params: Promise<{ sku: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku, locale: routeLocale } = await params;
  const { country, currency } = await getLocale();
  const product = await getProduct(sku, routeLocale, currency, country);

  if (!product) return {};

  return {
    title: product.name,
    description: product.description ?? product.name,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { sku, locale: routeLocale } = await params;
  const { country, currency } = await getLocale();

  const [product, attributeLabels] = await Promise.all([
    getProduct(sku, routeLocale, currency, country),
    getAttributeLabels(routeLocale),
  ]);

  if (!product) {
    notFound();
  }

  const activeVariant = product.variants.find((v) => v.sku === sku) ?? product.variants[0];

  // Category fetch needs the product's category id first, so it can't join the Promise.all
  // above — it's best-effort for the breadcrumb, so failures are swallowed.
  const categoryRef = product.categories[0];
  const category = categoryRef ? await getCategoryById(categoryRef.id, routeLocale).catch(() => null) : null;

  const isInStock = activeVariant.availability?.isOnStock !== false;
  const canAddToCart = isInStock && Boolean(activeVariant.price);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {category && (
        <div className="mb-6">
          <Breadcrumb
            items={[
              { name: category.name, href: `/category/${category.slug}` },
              { name: product.name, href: '#' },
            ]}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Gallery images={activeVariant.images} alt={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal sm:text-3xl">{product.name}</h1>
            <div className="mt-3">
              <PriceDisplay price={activeVariant.price} locale={routeLocale} />
            </div>
          </div>

          <div>
            <Badge variant={isInStock ? 'success' : 'error'}>{isInStock ? 'In Stock' : 'Out of Stock'}</Badge>
          </div>

          <VariantSelector product={product} activeSku={sku} />

          <AddToCartButton sku={activeVariant.sku} disabled={!canAddToCart} />

          {product.description && (
            <p className="border-t border-border pt-6 leading-relaxed text-charcoal-light">{product.description}</p>
          )}

          <AttributesTable attributes={activeVariant.attributes} labels={attributeLabels} />
        </div>
      </div>
    </div>
  );
}
