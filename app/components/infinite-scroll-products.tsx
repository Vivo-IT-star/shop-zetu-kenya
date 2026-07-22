import React, {useEffect, useRef, useState} from 'react';
import {cn} from '../lib/utils';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

export interface Product {
  id: string;
  title: string;
  handle: string;
  image: {
    id: string;
    url: string;
    altText: string | null;
    width: number;
    height: number;
  };
  price: string;
  compareAtPrice?: string;
  
}

export const InfiniteScrollingProducts = ({
  products,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  products: Product[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (
      containerRef.current &&
      scrollerRef.current &&
      scrollerRef.current.children.length === products.length
    ) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const clone = item.cloneNode(true);
        scrollerRef.current?.appendChild(clone);
      });
      setAnimationProps();
      setStart(true);
    }
  }, []);

  const setAnimationProps = () => {
    if (!containerRef.current) return;

    containerRef.current.style.setProperty(
      '--animation-direction',
      direction === 'left' ? 'forwards' : 'reverse',
    );

    const durations = {
      fast: '20s',
      normal: '40s',
      slow: '80s',
    };

    containerRef.current.style.setProperty(
      '--animation-duration',
      durations[speed] || '40s',
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('scroller relative', className)}
    >
      <section className="relative text-white overflow-hidden">
        
        <div className="overflow-x-auto">
          <ul
            ref={scrollerRef}
            className={cn(
              'flex w-max gap-4',
              start && 'animate-scroll',
              pauseOnHover && 'hover:[animation-play-state:paused]',
            )}
          >
            {products.map((product, idx) => (
              <li key={idx} className="relative  rounded-2xl">
                <div className="flex flex-col max-w-[200px] lg:w-[300px] text-center items-center gap-4">
                  <Link to={`/products/${product.handle}`}>
                    <div className="relative group overflow-hidden">
                      <Image
                        data={product.image}
                        alt={product.image.altText || product.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="aspect-[9/16] mx-auto object-cover  transform transition-transform duration-800 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <button className="bg-black text-white text-sm py-2 px-4 rounded hover:bg-gray-800 transition">
                          Buy Now
                        </button>
                      </div> */}
                    </div>
                    <div className="p-2 space-y-2">
                      <h3 className="font-semibold line-clamp-2 text-sm">
                        {product.title}
                      </h3>
                      <p className=" font-bold text-base">
                        UGX {parseFloat(product.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
