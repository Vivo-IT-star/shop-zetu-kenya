import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {
  type RegularSearchReturn,
  type PredictiveSearchReturn,
  getEmptyPredictiveSearchResult,
} from '~/lib/search';
import { IoSearch } from "react-icons/io5";
export const meta: MetaFunction = () => {
  return [{title: `Shopzetu | Search`}];
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise: Promise<PredictiveSearchReturn | RegularSearchReturn> =
    isPredictive
      ? predictiveSearch({request, context})
      : regularSearch({request, context});

  searchPromise.catch((error: Error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const {type, term, result, error} = useLoaderData<typeof loader>();
  if (type === 'predictive') return null;

  return (
    <div className="search-page max-w-7xl mx-auto px-4 py-8">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <SearchForm>
          {({inputRef}) => (
            <div className="flex gap-2 max-w-md">
              <input
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={term}
                name="q"
                placeholder="Search products, articles, pages..."
                ref={inputRef}
                type="search"
              />
              <button 
                type="submit" 
                className="lg:px-6 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
             <IoSearch />
              </button>
            </div>
          )}
        </SearchForm>
      </div> */}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {!term || !result?.total ? (
        <div className="text-gray-500 text-center py-12">
          No results found.
        </div>
      ) : (
        <div className="w-full">
          {result?.total > 0 && (
            <div className="mb-6">
              <p className="text-gray-600">
                Search Found {result.total} result{result.total !== 1 ? 's' : ''} for "{term}"
              </p>
            </div>
          )}
          <SearchResults result={result} term={term}>
            {({articles, pages, products, term}) => (
              <div className="space-y-12">
                <SearchResults.Products products={products} term={term} />
                {/* <SearchResults.Articles articles={articles} term={term} />
                <SearchResults.Pages pages={pages} term={term} /> */}
              </div>
            )}
          </SearchResults>
        </div>
      )}
      <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      sku
      barcode
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      prefix: LAST,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

// A barcode must be matched ONLY against the variant barcode field. The generic
// `search` query has no field restriction, so a numeric barcode leaks into SKU
// and title matches (e.g. unrelated accessories). `predictiveSearch` supports
// `searchableFields`, and it returns the PARENT product of the matching variant —
// exactly what we want to show for a barcode lookup.
export const SEARCH_PRODUCTS_BY_BARCODE_QUERY = `#graphql
  query SearchProductsByBarcode(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $term: String!
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: EACH,
      query: $term,
      searchableFields: [VARIANTS_BARCODE],
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      products {
        ...SearchProduct
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
` as const;

/**
 * Regular search fetcher
 */
async function regularSearch({
  request,
  context,
}: Pick<
  LoaderFunctionArgs,
  'request' | 'context'
>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 24});
  const term = String(url.searchParams.get('q') || '').trim();

  if (!term) {
    return {
      type: 'regular',
      term: '',
      result: {
        total: 0,
        items: {
          articles: {nodes: []},
          pages: {nodes: []},
          products: {
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      },
    };
  }

  // If the term looks like a barcode, resolve it against the variant barcode
  // field only and return the parent product(s) — never mix in accessories that
  // merely share the digits in a SKU or title.
  if (looksLikeBarcode(term)) {
    const {errors, predictiveSearch} = await storefront.query(
      SEARCH_PRODUCTS_BY_BARCODE_QUERY,
      // predictiveSearch caps `limit` at 10; a barcode maps to a single product.
      {variables: {term, limit: 10}},
    );
    const nodes = predictiveSearch?.products ?? [];
    if (nodes.length) {
      return {
        type: 'regular',
        term,
        error: errors
          ? errors.map(({message}: {message: string}) => message).join(', ')
          : undefined,
        result: {
          total: nodes.length,
          items: {
            articles: {nodes: []},
            pages: {nodes: []},
            products: {
              nodes,
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
              },
            },
          },
        },
      };
    }
    // No barcode match — fall through to the normal keyword search below.
  }

  // Prioritize a full-text match: an exact phrase (e.g. "Silk House Collection
  // Koa Top - White") is boosted ahead of loose keyword matches, while still
  // returning partial matches. A single token (e.g. a barcode) is passed as-is.
  const boostedTerm = buildBoostedQuery(term);

  // Search articles, pages, and products for the `q` term
  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, term: boostedTerm},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  // Deterministically float full matches (exact title / sku / barcode) to the
  // top, so full-text results always precede partial ones regardless of how
  // Shopify's RELEVANCE ranking orders the page.
  if (items.products?.nodes?.length) {
    items.products = {
      ...items.products,
      nodes: rankProductsByFullMatch(items.products.nodes, term),
    };
  }

  const total = Object.values(items).reduce(
    (acc, {nodes}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Builds a Shopify search query that boosts an exact phrase match ahead of
 * loose keyword matches. Multi-word terms become `("full phrase") OR (word AND
 * word ...)`; single tokens (including barcodes/SKUs) are passed through so the
 * default index still matches them. Double quotes and backslashes are stripped
 * to avoid breaking the query syntax.
 */
/**
 * A term is treated as a barcode when it is only digits and of a plausible
 * barcode length (EAN-8/UPC-A/EAN-13/GTIN-14 fall in the 8-14 range; we allow
 * from 6 to be safe). Barcode terms are resolved against the variant barcode
 * field only.
 */
function looksLikeBarcode(term: string): boolean {
  return /^\d{6,14}$/.test(term.trim());
}

function buildBoostedQuery(term: string): string {
  const cleaned = term.replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return term;
  if (!cleaned.includes(' ')) return cleaned;
  return `("${cleaned}") OR (${cleaned})`;
}

/**
 * Stable re-rank that promotes full matches over partial ones. Lower score =
 * higher priority; ties keep Shopify's original (relevance) order.
 */
function rankProductsByFullMatch<
  T extends {
    title?: string | null;
    selectedOrFirstAvailableVariant?: {
      sku?: string | null;
      barcode?: string | null;
    } | null;
  },
>(nodes: readonly T[], term: string): T[] {
  const norm = (s?: string | null) =>
    (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const t = norm(term);
  const words = t.split(' ').filter(Boolean);

  const score = (p: T): number => {
    const title = norm(p.title);
    const variant = p.selectedOrFirstAvailableVariant;
    const sku = norm(variant?.sku);
    const barcode = norm(variant?.barcode);

    if (title === t || sku === t || barcode === t) return 0; // exact full match
    if (title.startsWith(t)) return 1; // full phrase at start of title
    if (title.includes(t)) return 2; // full phrase anywhere in title
    if (words.length > 1 && words.every((w) => title.includes(w))) return 3; // all words present
    return 4; // partial / other
  };

  return nodes
    .map((p, i) => ({p, i, s: score(p)}))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.p);
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
` as const;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $searchableFields: [SearchableField!]
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      searchableFields: $searchableFields,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

/**
 * Predictive search fetcher
 */
async function predictiveSearch({
  request,
  context,
}: Pick<
  ActionFunctionArgs,
  'request' | 'context'
>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        // A barcode is matched against the barcode field only (returns the parent
        // product, no accessories that share the digits). Otherwise search across
        // title, type, vendor, variant title, and SKU.
        searchableFields: looksLikeBarcode(term)
          ? ['VARIANTS_BARCODE']
          : [
              'TITLE',
              'PRODUCT_TYPE',
              'VARIANTS_TITLE',
              'VARIANTS_SKU',
              'VARIANTS_BARCODE',
              'VENDOR',
            ],
        term,
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
