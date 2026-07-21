import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: MetaFunction = () => {
  return [{title: `Shopzetu | Blogs`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <div className="blogs mx-4 md:mx-8 lg:mx-16 my-8">
      <h1>Blogs</h1>
      <div className="">
        <PaginatedResourceSection connection={blogs}>
          {({node: blog}: {node: any}) => {
            // Sort articles by publishedAt descending
            const sortedArticles = blog.articles?.nodes
              ? [...blog.articles.nodes].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
              : [];
            return (
              <div key={blog.handle} className="mb-8">
                <h2>{blog.title}</h2>
                <ul>
                  {sortedArticles.map(article => (
                    <li key={article.handle}>
                      <Link
                        className="article"
                        prefetch="intent"
                        to={`/blogs/${blog.handle}/${article.handle}`}
                      >
                        <span>{article.title}</span>
                        <span className="ml-2 text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
        articles(first: 20) {
          nodes {
            title
            handle
            publishedAt
          }
        }
      }
    }
  }
` as const;
