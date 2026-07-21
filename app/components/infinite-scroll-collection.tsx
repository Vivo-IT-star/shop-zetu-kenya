import React, {useEffect, useRef, useState} from 'react';
import {Star} from 'lucide-react';
import {Image} from '@shopify/hydrogen';
import {cn} from '../lib/utils';
import {Link} from 'react-router';

export interface CollectionImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  image: CollectionImage;
}
export const InfiniteScrollingCollections = ({
  collections,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  collections: Collection[];
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
      scrollerRef.current.children.length === collections.length
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
      className={cn('scroller relative -mx-4 ', className)}
    >
      {/* <div className="text-center font-semibold text-2xl mb-4">
        Testimonials
      </div> */}
      <section className="relative text-white overflow-hidden">
       

          <div className=' overflow-x-auto'>

              <ul
          ref={scrollerRef}
          className={cn(
            'flex w-max gap-4 y-4',
            start && 'animate-scroll',
            pauseOnHover && 'hover:[animation-play-state:paused]',
          )}
        >

      

          {collections.map((collection, idx) => (
            <li key={idx} className="relative max-w-full shrink-0 rounded-2xl">
              <div className="flex flex-col collection-slider text-center collections-center gap-4">
                <Link to={`/collections/${collection.handle}`}>
                
                  <div className="relative group overflow-hidden">
                    {/* Image with hover zoom */}
        
                    <Image
                      data={collection.image}
                      alt={collection.image.altText || collection.title}
                      className="h-[280px] w-[210px] lg:h-[340px] lg:w-[260px] object-cover transform transition-transform duration-800 group-hover:scale-108"
                      sizes="(min-width: 1024px) 260px, 210px"
                      loading="eager"
                    />

                    {/* Overlay Button */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <button className="bg-black/40 text-white text-sm py-2 px-2 rounded hover:bg-gray-800 transition">
                        Shop Now
                      </button>
                    </div>
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
