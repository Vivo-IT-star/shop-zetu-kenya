import { useWishlist } from '~/lib/contexts/WishlistContext';
import { Link, useLoaderData } from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import { LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Image } from '@shopify/hydrogen';


export async function loader(args: LoaderFunctionArgs) {
   let customer;

  const isLoggedIn = await args.context.customerAccount.isLoggedIn();
  console.log('Am I logged in to wishlist? ', isLoggedIn);

  if (isLoggedIn) {
    const {data, errors} = await args.context.customerAccount.query(
      CUSTOMER_DETAILS_QUERY,
    );

    customer = data.customer
  }

  console.log("Customer in wishlist: ", customer)

  return { customer }

}


export default function WishlistPage() {
  const { wishlist, removeWishlist } = useWishlist();


  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-500">No items in your wishlist.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:-gap-6">
          {wishlist.map(item => (
            <li key={item.id} className="rounded-lg shadow  flex flex-col">
              <Link to={`/products/${item.handle}`} className="block">
                <Image src={item.image} alt={item.title} className="w-full h-full aspect-9/16 object-cover rounded-t-lg"  sizes='(min-width: 45em) 300px, 100vw' />
    
              </Link>
              <div className="flex-1 flex flex-col justify-between p-4">
                <Link to={`/products/${item.handle}`} className="font-semibold text-base mb-2 hover:underline line-clamp-2">{item.title}</Link>
                {/* Show price and compare price if available */}
                <div className="flex items-start gap-2 mb-2">
                  {item.price && (
                    <span className="font-bold ">Ksh {item.price}</span>
                  )}
                  {item.compareAtPrice && item.compareAtPrice !== '0' && parseFloat(item.compareAtPrice) > parseFloat(item.price || '0') && (
                    <span className="text-[#C20000] font-bold line-through">Ksh {item.compareAtPrice}</span>
                  )}
                </div>
                <button
                  className="mt-auto text-[#C20000] flex justify-start hover:text-red-700 text-sm"
                  aria-label="Remove from wishlist"
                  onClick={() => removeWishlist(item.id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
