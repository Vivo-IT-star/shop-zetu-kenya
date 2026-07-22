import React, {useEffect, useState, useRef} from 'react';
import {ChevronLeft, ChevronRight, Zap} from 'lucide-react';
import {cn} from '../lib/utils';
import {Link} from 'react-router';


// === Countdown Timer Component ===
const CountdownTimer = ({
  targetDate,
  endDate,
}: {
  targetDate: Date;
  endDate: Date;
}) => {
  const [timeLeft, setTimeLeft] = useState({hours: 0, minutes: 0, seconds: 0});
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const target = targetDate.getTime();
      const end = endDate.getTime();

      if (now < target) {
        const diff = target - now;
        setIsLive(false);
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else if (now >= target && now < end) {
        const diff = end - now;
        setIsLive(true);
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, endDate]);

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1 text-black md:text-xl font-semibold">
      <span>{isLive ? 'Flash Sale Ends In:' : 'Starts In:'}</span>
      <span className="font-mono md:ml-2">
        {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m :{' '}
        {formatTime(timeLeft.seconds)}s
      </span>
    </div>
  );
};


// === Flash Sale Component ===
const FLASH_SALE_SCHEDULE = [
  {
    start: new Date('2025-10-29T09:00:00Z'),
    end: new Date('2025-10-29T19:00:00Z'),
  },
  {
    start: new Date('2025-11-05T09:00:00Z'),
    end: new Date('2025-11-05T19:00:00Z'),
  },
];

const getActiveFlashSale = () => {
  const now = Date.now();
  for (const sale of FLASH_SALE_SCHEDULE) {
    if (now < sale.end.getTime()) return sale;
  }
  return FLASH_SALE_SCHEDULE[0];
};

export const ProductsCarouselTemplate = ({products, className}: any) => {
 const activeFlashSale = getActiveFlashSale();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmt = dir === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({left: scrollAmt, behavior: 'smooth'});
    }
  };

  return (
    <div className={cn('relative max-w-7xl mx-auto mt-12 md:mt-8', className)}>
      {/* Header */}
       {/* <div className="bg-[#DBEA31]  md:px-6 py-3 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-2">
           <div className="flex items-center gap-3">
             <Zap className="w-6 h-6 fill-current animate-pulse" />
             <span className="text-lg font-bold">Flash Sales | Live Now</span>
           </div>
   
           <div className="hidden md:flex flex-1 justify-center">
             <CountdownTimer
               targetDate={activeFlashSale.start}
               endDate={activeFlashSale.end}
             />
           </div>
   
           <button
             variant="ghost"
             className=" hover:bg-white/10 font-semibold"
           >
             See All
             <ChevronRight className="w-4 h-4 ml-1" />
           </button>
   
           <div className="md:hidden flex justify-start">
             <CountdownTimer
               targetDate={activeFlashSale.start}
               endDate={activeFlashSale.end}
             />
           </div>
         </div> */}
    

      {/* Scroll buttons */}
      <button
       
      
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-black cursor-pointer hover:text-white"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-8 h-8 p-2" />
      </button>

      {/* Scrollable Product List */}
      <section className="relative md:-mt-4 text-white overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth no-scrollbar"
        >
          <ul className="flex w-max gap-4 px-6 py-4">
            {products.map((product: any, idx: number) => (
              <li key={idx} className="relative rounded-2xl shrink-0">
                <div className="flex flex-col max-w-[200px] lg:w-[300px] gap-4">
                  <Link to={`/products/${product.handle}`}>
                    <div className="relative group overflow-hidden rounded-md">
                      <img
                        src={product.image.url}
                        alt={product.image.altText || product.title}
                        className="aspect-[9/16] mx-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                      />
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

      <button
     
      
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-black cursor-pointer hover:text-white"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-8 h-8 p-2" />
      </button>
    </div>
  );
};
