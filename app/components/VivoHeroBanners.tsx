import React, {useState, useEffect, useRef} from 'react';
import {RxCaretRight, RxCaretLeft} from 'react-icons/rx';
import {NavLink} from 'react-router';
import {Image} from '@shopify/hydrogen';

const banners = [

  {
    name: 'Vivo Mid-Year Sale',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/50_Web_Banner_A.jpg?v=1781077333',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/50_Web_Mobile_Banner_1.jpg?v=1781077332',
    href: '/collections/mid-month-sale-1',
  },

   {
    name: 'New Styles',
    imageDesktop:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/JUNE_WARDROBE_Website_2.jpg?v=1781701295',
    imageMobile:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/JUNE_WARDROBE_Mobile_Website_2.jpg?v=1781701295',
    href: '/collections/vivo-june-new-styles',

  },


  
  {
    name: 'Vivo Baridi Campaign',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/BarIdi_Campaign_web_banner_SZ_1_b19a8eb2-44fc-4373-bc80-00d48d230db2.jpg?v=1778136519',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Baridi_Campaign_Mobile_SZ_2cf0d64f-9262-4640-b008-9e898f092465.jpg?v=1778136517',
    href: '/collections/vivo-outerwear-1',
  },

    // {
  //   name: 'New Styles',
  //   imageDesktop:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Archive_Edit_Website.jpg?v=1776419708',
  //   imageMobile:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Archive_Edit_Website_Mobile.jpg?v=1776419708',
  //   href: '/collections/vivo-june-new-styles',

  // },

  // {
  //   name: 'Vivo Iyana',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Iyana_Website.jpg?v=1759133909',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Iyana_Website_mobile.jpg?v=1759133909',
  //   href: '/collections/vivo-iyana-collection',
  // },

  //  {
  //   name: 'New Arrivals',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Aug_New_Arrivals_website.jpg',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Aug_New_Arrivals_website_mobile.jpg?height=1200&v=1754890112',
  //   href: '/collections/vivo-august-new-arrivals',
  // },

  //   {
  //   name: 'Everyday Essentials',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Essentials_Web_1_e31d2ee2-0a9d-4ba2-bfaf-d78372679913.jpg?v=1755669019',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Essentials_Web_mobile_12764485-41c4-4cf9-bb7a-730f0733e018.jpg?v=1755669017',
  //   href: '/collections/vivo-basics',
  // },

  // {
  //   name: 'Pants',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Pants_Website_Banner_-1.jpg?v=1754075213',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Pants_Mobile_Banner_f162973d-200d-4db3-9382-a2936e8a3475.jpg?v=1754075213',
  //   href: '/collections/eom-june',
  // },

  //   {
  //     name: 'Naledi',
  //     imageDesktop: '/naledi-desktop.webp',
  //     imageMobile: '/naledi-mobile.webp',
  //     href: '/collections/naledi',
  //   },

  //   {
  //     name: 'Bold',
  //     imageDesktop: '/She_Moves_Desktop.jpg',
  //     imageMobile: '/She_Moves_Mobile.jpg',
  //     href: '/collections/pb-ankara',
  //   },
];
const VivoHeroBanners = () => {
  const [index, setIndex] = useState(0);
  const totalbanners = banners.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const startXRef = useRef<number | null>(null);
  const endXRef = useRef<number | null>(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalbanners);
    }, 8000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();

    return stopAutoSlide;
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + totalbanners) % totalbanners);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % totalbanners);
  };

  const handleDotClick = (i: number) => {
    setIndex(i);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    endXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (startXRef.current !== null && endXRef.current !== null) {
      const delta = startXRef.current - endXRef.current;

      if (Math.abs(delta) > 50) {
        if (delta > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    startXRef.current = null;
    endXRef.current = null;
  };

  return (
    <div
      ref={sliderRef}
      className="relative bg-white z-30 mx-auto lg:-mt-6"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div className="relative  -mx-4 hero-slider">
        {/* Desktop aspect ratio container */}
        <div className="hidden sm:block aspect-16/6 w-full max-w-screen-3xl mx-auto">
          {banners.map((banner, i) => (
            <NavLink
              to={banner.href}
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === index ? 'opacity-100 z-1' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={banner.imageDesktop}
                sizes="100vw"
                alt={banner.name}
                className="object-contain w-full h-full"
                loading='eager'
              />
            </NavLink>
          ))}
        </div>
        {/* Mobile image container as before */}
        <div className="block sm:hidden h-[450px] w-full">
          {banners.map((banner, i) => (
            <NavLink
              to={banner.href}
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === index ? 'opacity-100 z-1' : 'opacity-0 z-0'
              }`}
            >
              <Image
                alt={banner.name}
                sizes="(min-width: 45em) 300px, 100vw"
                className="object-cover w-full h-full"
                src={banner.imageMobile}
                loading='eager'
              />
            </NavLink>
          ))}
        </div>
      </div>

      {/* Navigation buttons - always centered vertically and inside image container */}
      <button
        className="absolute -bottom-10 lg:bottom-8 left-2 -translate-y-1/2 bg-black/60 hover:bg-black p-2 rounded-full z-5"
        onClick={handlePrev}
      >
        <RxCaretLeft size={24} className="text-white hover:font-bold" />
      </button>
      <button
        className="absolute -bottom-10 lg:bottom-8 right-4 -translate-y-1/2 bg-black/60 hover:bg-black p-2 rounded-full z-5"
        onClick={handleNext}
      >
        <RxCaretRight size={24} className="text-white hover:font-bold" />
      </button>

      {/* Dot Indicators */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-black" : "bg-white/50"
            }`}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div> */}
    </div>
  );
};

export default VivoHeroBanners;
