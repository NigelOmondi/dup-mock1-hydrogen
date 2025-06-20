import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import HeroSlider from '~/components/HeroSlider';

const testimonials = [
  {
    avatar: '/zola-light-men.webp',
    name: 'Robert Mwangi',
    quote: 'Such a Great fit and durable quality.',
    product: "Men's Polo Shirt - Blue",
    stars: 5,
  },
  {
    avatar: '/zola-mens-polo.webp',
    name: 'Bill Clinton',
    quote: 'Worth every cent.',
    product: "Men's Polo Shirt - Purple",
    stars: 4,
  },
  {
    avatar: '/white1.webp',
    name: 'Grace Otieno',
    quote: 'Fast delivery and amazing quality. Will shop again.',
    product: 'Vivo Waridi Sleeveless Overcoat - Black',
    stars: 5,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
];

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'ShopZetu | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    fetchedCollections: collections.nodes, // all collections
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  
  const collectionHandles = [
    'sale-side-story',
    'father-figures',
    'dear-diary',
    'the-cool-down',
  ];
  const orderedCollections = collectionHandles
    .map((handle) =>
      data.fetchedCollections.find((c) => c.handle === handle),
    )
    .filter(Boolean);
  const collectionList = [
    'kuldra',
    'vivo',
    'mandevu',
    'safari-by-vivo',
    'accessorize-with-style',
    'phyls-collection',
    'kalungi',
    'iristyle',
    'plain-chic',
    'inroses-hub',
    'vazi-afriq',
    'liliadly',
    'auri-accessory',
    'bura-studio'
  ];

  const slidingCollections = collectionList
    .map((handle) =>
      data.fetchedCollections.find((c) => c.handle === handle),
    )
    .filter(Boolean)
    .map((collection) => ({
      ...collection,
      image: collection.image ?? {
        id: '',
        url: '',
        altText: '',
        width: 0,
        height: 0,
      }, // Provide a fallback image object if missing
    }));

  return (
    <div className="home">
      <HeroSlider />
      <FeaturedCollection collection={data.featuredCollection} />
       <CartUpsell featuredCollection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

// I have tried exporting this . the featured collection returns undefined
export function CartUpsell({featuredCollection}) {
  if (!featuredCollection) return null;
  return (
    <div className="cart-upsell">
       <h1>Title: {featuredCollection.title}</h1>
    </div>
  );
}


/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

export const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
