
import React, { createContext, useContext, useEffect, useState } from 'react';


export type WishlistItem = {
  id: string;
  handle: string;
  title: string;
  image: string;
  price?: string;
  compareAtPrice?: string;
};

interface WishlistContextType {
  wishlist: WishlistItem[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeWishlist: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};


export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SSR-safe wishlist state
  const [wishlist, setWishlist] = useState<WishlistItem[] | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setWishlist(parsed as WishlistItem[]);
          else setWishlist([]);
        } catch (e) {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    }
  }, []);

  useEffect(() => {
    if (wishlist !== undefined) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // Only render children when wishlist is loaded (client-side)
  if (wishlist === undefined) return null;

  const isWishlisted = (id: string) => wishlist!.some(item => item.id === id);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      if (!prev) return [item];
      if (prev.some(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const removeWishlist = (id: string) => {
    setWishlist(prev => prev ? prev.filter(i => i.id !== id) : []);
  };

  return (
    <WishlistContext.Provider value={{ wishlist: wishlist!, isWishlisted, toggleWishlist, removeWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
