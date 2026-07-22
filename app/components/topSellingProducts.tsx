// import React, {useEffect, useRef, useState} from 'react';
// import {ChevronLeft, ChevronRight, Zap} from 'lucide-react';
// import {cn} from '../lib/utils';
// import {Link} from 'react-router';
// import {button} from './ui/button';

// export interface Product {
//   id: string;
//   title: string;
//   handle: string;
//   image: {
//     id: string;
//     url: string;
//     altText: string | null;
//     width: number;
//     height: number;
//   };
//   price: string;
// }

// // === Countdown Timer Component ===
// const CountdownTimer = ({
//   targetDate,
//   endDate,
// }: {
//   targetDate: Date;
//   endDate: Date;
// }) => {
//   const [timeLeft, setTimeLeft] = useState({hours: 0, minutes: 0, seconds: 0});
//   const [isLive, setIsLive] = useState(false);

//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       const now = Date.now();
//       const target = targetDate.getTime();
//       const end = endDate.getTime();

//       if (now < target) {
//         const diff = target - now;
//         setIsLive(false);
//         setTimeLeft({
//           hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
//           minutes: Math.floor((diff / 1000 / 60) % 60),
//           seconds: Math.floor((diff / 1000) % 60),
//         });
//       } else if (now >= target && now < end) {
//         const diff = end - now;
//         setIsLive(true);
//         setTimeLeft({
//           hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
//           minutes: Math.floor((diff / 1000 / 60) % 60),
//           seconds: Math.floor((diff / 1000) % 60),
//         });
//       }
//     };

//     calculateTimeLeft();
//     const timer = setInterval(calculateTimeLeft, 1000);
//     return () => clearInterval(timer);
//   }, [targetDate, endDate]);

//   const formatTime = (n: number) => n.toString().padStart(2, '0');

//   return (
//     <div className="flex items-center gap-1 text-black md:text-xl font-semibold">
//       <span>{isLive ? 'Flash Sale Ends In:' : 'Starts In:'}</span>
//       <span className="font-mono">
//         {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m :{' '}
//         {formatTime(timeLeft.seconds)}s
//       </span>
//     </div>
//   );
// };

// // === Flash Sale Component ===
// const FLASH_SALE_SCHEDULE = [
//   {
//     start: new Date('2025-10-29T09:00:00Z'),
//     end: new Date('2025-10-29T19:00:00Z'),
//   },
//   {
//     start: new Date('2025-11-05T09:00:00Z'),
//     end: new Date('2025-11-05T19:00:00Z'),
//   },
// ];

// const getActiveFlashSale = () => {
//   const now = Date.now();
//   for (const sale of FLASH_SALE_SCHEDULE) {
//     if (now < sale.end.getTime()) return sale;
//   }
//   return FLASH_SALE_SCHEDULE[0];
// };

// export const FlashSaleProductsCarousel = ({
//   products,
//   className,
// }: {
//   products: Product[];
//   className?: string;
// }) => {
//   const activeFlashSale = getActiveFlashSale();

//    const scroll = (dir: 'left' | 'right') => {
//     const container = document.getElementById('flash-sales-scroll');
//     if (container) {
//       const scrollAmt = dir === 'left' ? -300 : 300;
//       container.scrollBy({left: scrollAmt, behavior: 'smooth'});
//     }
//   };

//   return (
//     <div className=" max-w-7xl mx-auto">
//       <div className="bg-[#DBEA31] px-4 md:px-6 py-3 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//         <div className="flex items-center gap-3">
//           <Zap className="w-6 h-6 fill-current animate-pulse" />
//           <span className="text-lg font-bold">Flash Sales | Live Now</span>
//         </div>

//         <div className="hidden md:flex flex-1 justify-center">
//           <CountdownTimer
//             targetDate={activeFlashSale.start}
//             endDate={activeFlashSale.end}
//           />
//         </div>

//         <button variant="ghost" className=" hover:bg-white/10 font-semibold">
//           See All
//           <ChevronRight className="w-4 h-4 ml-1" />
//         </button>

//         <div className="md:hidden flex justify-start">
//           <CountdownTimer
//             targetDate={activeFlashSale.start}
//             endDate={activeFlashSale.end}
//           />
//         </div>
//       </div>

//        <button
//           variant="outline"
//           size="icon"
//           className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 shadow-lg hover:bg-orange-500 hover:text-white"
//           onClick={() => scroll('left')}
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </button>

//       {/* Products Section */}
//       <section className="relative -mt-4 text-black overflow-hidden">
//         <div className="overflow-x-auto">
//           <ul className={cn('flex w-max gap-4')}>
//             {products.map((product, idx) => (
//               <li key={idx} className="relative  rounded-2xl">
//                 <div className="flex flex-col max-w-[200px] lg:w-[300px] gap-4">
//                   <Link to={`/products/${product.handle}`}>
//                     <div className="relative group overflow-hidden">
//                       <img
//                         src={product.image.url}
//                         alt={product.image.altText || product.title}
//                         className="aspect-9/16 mx-auto object-cover rounded-sm transform transition-transform duration-800 group-hover:scale-105"
//                         loading="lazy"
//                       />

//                       {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
//                         <button className="bg-black text-white text-sm py-2 px-4 rounded hover:bg-gray-800 transition">
//                           Buy Now
//                         </button>
//                       </div> */}
//                     </div>
//                     {/* <div className="mt-2 ">
//                       <h3 className="font-semibold line-clamp-2">{product.title}</h3>
//                       <p className="text-sm text-gray-600">{product.price}</p>
//                     </div> */}

//                     <div className="p-4 space-y-2">
//                       <div className="line-clamp-2 semi-bold">
//                         {product.title}
//                       </div>
//                       <div className="flex items-baseline gap-2">
//                         <span className="text-lg font-bold text-gray-600">
//                           UGX {parseFloat(product.price).toLocaleString()}
//                         </span>
//                         <span className="text-sm text-muted-foreground line-through"></span>
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </section>

//        <button
//           variant="outline"
//           size="icon"
//           className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 shadow-lg hover:bg-orange-500 hover:text-white"
//           onClick={() => scroll('right')}
//         >
//           <ChevronRight className="w-5 h-5" />
//         </button>
//     </div>
//   );
// };

import React, {useEffect, useState, useRef} from 'react';
import {ChevronLeft, ChevronRight, Zap} from 'lucide-react';
import {cn} from '../lib/utils';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

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
    start: new Date('2025-11-06T09:00:00Z'),
    end: new Date('2025-11-07T09:00:00Z'),
  },
  {
    start: new Date('2025-11-07T09:00:00Z'),
    end: new Date('2025-11-08T09:00:00Z'),
  },
  {
    start: new Date('2025-11-08T09:00:00Z'),
    end: new Date('2025-11-09T09:00:00Z'),
  },
  {
    start: new Date('2025-11-09T09:00:00Z'),
    end: new Date('2025-11-10T09:00:00Z'),
  },
];

const getActiveFlashSale = () => {
  const now = Date.now();
  for (const sale of FLASH_SALE_SCHEDULE) {
    if (now < sale.end.getTime()) return sale;
  }
  return FLASH_SALE_SCHEDULE[0];
};

export const NewInProductsCarousel = ({products, className}: any) => {
  const activeFlashSale = getActiveFlashSale();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmt = dir === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({left: scrollAmt, behavior: 'smooth'});
    }
  };

  return (
    <div
      className={cn(
        'relative max-w-7xl h-full mx-auto mt-12 md:mt-8',
        className,
      )}
    >
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
      <div className="bg-orange-500 text-black pl-4 md:px-6 py-2 md:-mb-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        {/* Row 1 (mobile): Flash + See All */}
        {/* Row 1 (md+): Flash (left), Timer (center), See All (right) */}
        <div className="w-full flex items-center justify-between md:gap-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 fill-current animate-pulse" />
            <span className="text-lg font-bold">Vivo New In Products</span>
            {/* <span className="text-lg font-bold">Shift Dresses On Sale</span> */}
          </div>

          {/* Desktop Countdown: center the countdown */}
          {/* <div className="hidden md:flex flex-1 justify-center">
            <CountdownTimer
              targetDate={activeFlashSale.start}
              endDate={activeFlashSale.end}
            />
          </div> */}

          {/* See All right aligned always */}
          <Link
            to={'/collections/vivo-february-new-styles'}
            className="text-black hover:bg-flash-sale-foreground/10 font-semibold"
          >
            <div className="flex gap-1 items-center justify-center">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Mobile-only countdown on its own row */}
        {/* <div className="md:hidden flex justify-start">
          <CountdownTimer
            targetDate={activeFlashSale.start}
            endDate={activeFlashSale.end}
          />
        </div> */}
      </div>

      {/* Scroll buttons */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-black cursor-pointer hover:text-white"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-8 h-8 p-2" />
      </button>

      {/* Scrollable Product List */}
      <section className="relative overflow-hidden h-full flex items-center ">
        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth no-scrollbar h-full"
        >
          <ul className="flex gap-4 px-6 h-full ">
            {products.map((product: any, idx: number) => (
              <li
                key={idx}
                className="relative shrink-0 h-full w-[150px] md:w-[170px]  "
              >
                <div className="flex flex-col h-full gap-2">
                  <Link
                    to={`/products/${product.handle}`}
                    className="flex flex-col h-full"
                  >
                    <div className="relative group overflow-hidden rounded-md flex-1">
                      {/* <img
                        src={product.image.url}
                        alt={product.image.altText || product.title}
                        className="h-full w-full object-cover aspect-[9/16] transform transition-transform duration-700 group-hover:scale-105"
                        
                      /> */}
                      <Image
                        src={product.image.url}
                        alt={product.image.altText || product.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="h-full w-full object-cover aspect-9/16 transform transition-transform duration-700 group-hover:scale-105"
                        loading="eager"
                      />

                      {/* DISCOUNT BADGE */}
                      {product.compareAtPrice &&
                        parseFloat(product.compareAtPrice) >
                          parseFloat(product.price) && (
                          <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] md:text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                            {Math.round(
                              ((parseFloat(product.compareAtPrice) -
                                parseFloat(product.price)) /
                                parseFloat(product.compareAtPrice)) *
                                100,
                            )}
                            % OFF
                          </span>
                        )}
                    </div>
                    <div className="p-2 space-y-1 flex flex-col justify-center items-center rounded-b-md">
                      <h3 className="font-semibold line-clamp-1 text-center text-xs">
                        {product.title}
                      </h3>
                      <div className="flex gap-2">
                        <div className="font-bold text-xs">
                          UGX {parseFloat(product.price).toLocaleString()}
                        </div>
                        <p>
                          {product.compareAtPrice &&
                            product.compareAtPrice > 0 && (
                              <span className="text-xs text-red-500 line-through">
                                UGX
                                {parseFloat(
                                  product.compareAtPrice,
                                ).toLocaleString()}
                              </span>
                            )}
                        </p>
                      </div>
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
