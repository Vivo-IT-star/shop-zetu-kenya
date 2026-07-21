import React, {useState, useEffect, useRef} from 'react';
import {RxCaretRight, RxCaretLeft} from 'react-icons/rx';
import {NavLink} from 'react-router';
import {Image} from '@shopify/hydrogen';

const slides = [

  
  {

    name: 'pb-Sweaters & Ponchos',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_43812387-9c57-459e-8107-fcaea5b22c25.jpg?v=1783499910',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_74bea684-dd38-411c-90a4-1fe8572c1183.jpg?v=1783499910',
    href: '/collections/pb-sweaters-ponchos',
  },

  // {

  //   name: 'zosa',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_7bdc4f99-9b5d-486e-95f9-7949861d6d89.jpg?v=1780478162',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_8e61b599-3912-4a8b-9d73-91b2f3e5f7f7.jpg?v=1780478163',
  //   href: '/collections/zosa',
  // },
  {
    name: 'Vivo Mid-Year Sale',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/50_Web_Banner_A.jpg?v=1781077333',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/50_Web_Mobile_Banner_1.jpg?v=1781077332',
    href: '/collections/mid-month-sale-1',
  },

 {

    name: 'Ankara Touch',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_ad24a0ed-6df7-4aec-a2c1-588e0427145c.jpg?v=1781265165',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_dc141b65-d67c-435a-a09d-3e388e3d5344.jpg?v=1781265164',
    href: '/collections/pb-ankara-fits',
  },

  {
    name: 'Vivo Baridi Campaign',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/BarIdi_Campaign_web_banner_SZ_1_b19a8eb2-44fc-4373-bc80-00d48d230db2.jpg?v=1778136519',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Baridi_Campaign_Mobile_SZ_2cf0d64f-9262-4640-b008-9e898f092465.jpg?v=1778136517',
    href: '/collections/vivo-outerwear-1',
  },

  // {

  //   name: 'Pb Sale',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_79a54d66-1aba-4cf8-a830-07d1789b6087.jpg?v=1782201303',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_6b5cb321-d524-41dc-9cf9-e2e2f74da672.jpg?v=1782201303',
  //   href: '/collections/pb-sale',
  // },

  {
    name: 'pb-all-dresses',
    imageDesktop:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_041a9a86-346a-4f92-ba4e-9362ced2d9a6.jpg?v=1780478495',
    imageMobile:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_bddb55d8-2e2f-46c1-bc2e-b154c509f9bc.jpg?v=1780478495',
    href: '/collections/pb-all-dresses',
  }, 

  

  {
    name: 'Safari Zehra-Collection',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Dress_to_Impress_Website_SZ.jpg?v=1778240291',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Dress_to_Impress_Website_mobile_SZ.jpg?v=1778240289',
    href: '/collections/safari-by-vivo',
  },



  // {
  //   name: 'New Styles',
  //   imageDesktop:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/JUNE_WARDROBE_Website_2.jpg?v=1781701295',
  //   imageMobile:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/JUNE_WARDROBE_Mobile_Website_2.jpg?v=1781701295',
  //   href: '/collections/vivo-june-new-styles',

  // },


  //  {
  //   name: 'Vivo Under 3K',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Feb_Under_3k_Web.jpg?v=1779346930',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Feb_Under_3k_Mobile_Web.jpg?v=1779346929',
  //   href: '/collections/vivo-under-3k',
  // },

 
 


  // {
  //   name: 'Vivo April Baridi Campagn',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/BarIdi_Campaign_web_banner_SZ_1.jpg?v=1777449174',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Baridi_Campaign_Mobile_SZ_bcfeddf2-f0bf-4643-b8f7-01a0d4018257.jpg?v=1777449174',
  //   href: '/collections/april-new-styles',
  // },

  // {

  //   name: 'Pb Sale',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_09f9ff6a-3a7e-4f37-8a88-0608959aef6e.jpg?v=1780657693',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_163d1d05-89f0-411e-9af6-5f3f717e4eb9.jpg?v=1780657692',
  //   href: '/collections/pb-sale',
  // },


  // {
  //   name: 'Vivo Baridi Campaign',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/BarIdi_Campaign_web_banner_SZ_1_b19a8eb2-44fc-4373-bc80-00d48d230db2.jpg?v=1778136519',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Baridi_Campaign_Mobile_SZ_2cf0d64f-9262-4640-b008-9e898f092465.jpg?v=1778136517',
  //   href: '/collections/vivo-outerwear-1',
  // },


 

  // {
  //   name: 'pb Flash-sale',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_31467d14-aaa4-49f2-b080-da54663e8c28.jpg?v=1780657684',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_c6db416a-a94f-4b66-b104-ab59474e9e9a.jpg?v=1780657684',
  //   href: '/collections/flash-sale',
  // },












  
  // {

  //   name: 'Silk House',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_9a97f912-160b-4eb1-bfd4-33e7756053bf.jpg?v=1777290324',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_daef4af8-37cd-4ca1-a4ab-574f09773123.jpg?v=1777290324',
  //   href: '/collections/silk-house-collection',
  // }
  // {
  //   name: 'Vivo April New Styles',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/April_New_styles_Web.jpg?v=1775555396',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/April_New_styles_Web_Mobile.jpg?v=1775555396',
  //   href: '/collections/april-new-styles',
  // },


  // {
  //   name: 'Vivo Baridi Campaign',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/BarIdi_Campaign_web_banner_SZ_1_b19a8eb2-44fc-4373-bc80-00d48d230db2.jpg?v=1778136519',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Baridi_Campaign_Mobile_SZ_2cf0d64f-9262-4640-b008-9e898f092465.jpg?v=1778136517',
  //   href: '/collections/vivo-outerwear-1',
  // },



  // {
  //   name: 'Vivo Baridi Campaign',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/BarIdi_Campaign_web_banner_SZ_1_b19a8eb2-44fc-4373-bc80-00d48d230db2.jpg?v=1778136519',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Baridi_Campaign_Mobile_SZ_2cf0d64f-9262-4640-b008-9e898f092465.jpg?v=1778136517',
  //   href: '/collections/vivo-outerwear-1',
  // },






  // {
  //   name: 'shopzetu_sales_vivo',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Archive_Edit_Website.jpg?v=1776419708',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Archive_Edit_Website_Mobile.jpg?v=1776419708',
  //   href: '/collections/shopzetu_sales_vivo',
  // },

  


  // {
  //   name: 'pb-all-dresses',
  //   imageDesktop:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_041a9a86-346a-4f92-ba4e-9362ced2d9a6.jpg?v=1780478495',
  //   imageMobile:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_bddb55d8-2e2f-46c1-bc2e-b154c509f9bc.jpg?v=1780478495',
  //   href: '/collections/pb-all-dresses',
  // }, 


  
  // {
  //   name: 'Vivo On Sale',
  //   imageDesktop:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Back_on_Budget_Web.jpg?v=1768210137',
  //   imageMobile:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Back_on_Budget_Web_Mobile.jpg?v=1768210137',
  //   href: '/collections/vivo-on-sale',
  // },

  // {

  //   name: 'SZ New Arrivals',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_5bfc400f-9e1a-45cf-a7e1-2ba782712b2a.jpg?v=1773404059',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_26f715a9-14ab-4951-8eeb-c68f58f75349.jpg?v=1773404059',
  //   href: '/collections/new-arrivals',
  // },


  // {
  //   name: 'Maxi Dresses',
  //   imageDesktop:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/WEBSITE_BANNER_42856a88-8a7b-48c2-9376-74b8664f2a1c.jpg?v=1764918604',
  //   imageMobile:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_copy_3ded0820-363e-4906-9a5c-c320cc162285.jpg?v=1764918603',
  //   href: '/collections/pb-maxi-dresses',
  // },

 


 

  // {
  //   name: 'SZ New Arrivals',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Website_Banner_828e2485-a00d-4499-a285-03647c51d87e.jpg?v=1765198979',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Mobile_Banner_f29c06fb-c281-4b0d-8b73-dee64051e767.jpg?v=1765198978',
  //   href: '/collections/pb-new-in-black-nov',
  // },



  // {
  //   name: ' Partner Brands Tops',
  //   imageDesktop:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Tops_Website_Banner_353afc30-5b39-44bf-8dca-5c3bd48026dc.jpg?v=1764664678',
  //   imageMobile:
  //     'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Tops_Website_Mobile_Banner_2352edd3-6fbb-41bd-9b81-492e75436948.jpg?v=1764664677',
  //   href: '/collections/pb-tops',
  // },

 

  /*{
    name: 'Curvy & Plus Size',
    imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Plus_ize_Website_Banner_d581da91-fed9-4065-b4ab-cab47831a348.jpg?v=1760007939',
    imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Plus_ize_Mobile_Banner_8c24cc46-b596-4374-b526-f1cb84176754.jpg?v=1760007939',
    href: '/shop/curvy-plus-size',
  },*/
 ];
const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const totalSlides = slides.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const startXRef = useRef<number | null>(null);
  const endXRef = useRef<number | null>(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalSlides);
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
    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % totalSlides);
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
      className="relative mx-auto lg:-mt-8"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div className="relative hero-slider">
        {/* Desktop aspect ratio container */}
        <div className="hidden sm:block aspect-16/6 w-full  mx-auto">
          {slides.map((slide, i) => (
            <NavLink
              to={slide.href}
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === index ? 'opacity-100 z-1' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={slide.imageDesktop}
                sizes="100vw"
                alt={slide.name}
                className="object-contain w-full h-full"
                loading='eager'
              />
               
            </NavLink>
          ))}
        </div>
        {/* Mobile image container as before */}
        <div className="block sm:hidden h-[450px] w-full">
          {slides.map((slide, i) => (
            <NavLink
              to={slide.href}
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === index ? 'opacity-100 z-1' : 'opacity-0 z-0'
              }`}
            >
              <Image
                alt={slide.name}
                sizes="(min-width: 45em) 300px, 100vw"
                className="object-cover w-full h-full"
                src={slide.imageMobile}
                loading='eager'
              />
             
            </NavLink>
          ))}
        </div>
      </div>

      {/* Navigation buttons - always centered vertically and inside image container */}
      <button
        className="absolute cursor-pointer -bottom-10 lg:bottom-8 left-4 -translate-y-1/2 bg-black/60 hover:bg-green-600 p-2 rounded-full z-5"
        onClick={handlePrev}
      >
        <RxCaretLeft size={24} className="text-white hover:font-bold" />
      </button>
      <button
        className="absolute cursor-pointer -bottom-10 lg:bottom-8 right-4 md:right-20 -translate-y-1/2 bg-black/60 hover:bg-green-600 p-2 rounded-full z-5"
        onClick={handleNext}
      >
        <RxCaretRight size={24} className="text-white hover:font-bold" />
      </button>

      {/* Dot Indicators */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
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

export default HeroSlider;
