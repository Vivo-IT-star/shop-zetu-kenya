import React, {useEffect, useRef, useState} from 'react';
import {Star, ChevronLeft, ChevronRight} from 'lucide-react';
import {cn} from '../lib/utils';

type Testimonial = {
  avatar: string;
  name: string;
  quote: string;
  product: string;
  stars: number;
};

export const InfiniteTestimonials = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  items: Testimonial[];
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
      scrollerRef.current.children.length === items.length
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

  const scrollBy = (offset: number) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({
        left: offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('scroller relative pb-4 overflow-hidden', className)}
    >
      <section className="relative py-16 overflow-hidden">
        <div className="text-center text-black font-semibold text-2xl mb-8">
          What Our Customers Say
        </div>

       
        {/* Testimonial List */}
        <div className="overflow-x-auto">
<ul ref={scrollerRef} className="flex gap-4 w-max scroll-smooth">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="relative w-[350px] flex-shrink-0 rounded-2xl border border-zinc-200 bg-white p-6 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="flex flex-col text-center items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.product}
                </span>
                <div className="flex">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < item.stars ? 'text-yellow-400' : 'text-gray-300',
                      )}
                      fill={i < item.stars ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  “{item.quote}”
                </p>
                <p className="text-sm mt-4 text-black italic dark:text-gray-300 ">
                  {item.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
        </div>
        

         {/* Scroll Buttons */}
        {/* <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => scrollBy(-400)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scrollBy(400)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div> */}

      </section>
    </div>
  );
};
