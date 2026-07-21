import { useWishlist } from '~/lib/contexts/WishlistContext';
import { Link } from 'react-router';
import { Image } from '@shopify/hydrogen';

export default function WishlistPage() {
  const { wishlist, removeWishlist } = useWishlist();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-500">No items in your wishlist.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6">
          {wishlist.map(item => (
            <li key={item.id} className="flex items-center gap-4 border p-4 rounded-lg shadow">
              <Image src={item.image} alt={item.title}  sizes='(min-width: 45em) 300px, 100vw' className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <Link to={`/products/${item.handle}`} className="font-semibold text-lg hover:underline">{item.title}</Link>
              </div>
              <button
                className="ml-4 text-[#C20000] hover:text-red-700"
                aria-label="Remove from wishlist"
                onClick={() => removeWishlist(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
