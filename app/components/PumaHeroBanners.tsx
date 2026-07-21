import React, {useState, useEffect, useRef} from 'react';
import {RxCaretRight, RxCaretLeft} from 'react-icons/rx';
import {NavLink} from 'react-router';
import {Image} from '@shopify/hydrogen';

const banners = [
  {
    name: 'Puma Women Fits',
    imageDesktop:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/puma_desktop_banner.avif?v=1767685019',
    imageMobile:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/puma_mobile_banner.avif?v=1767685019',
    href: '/shop/puma',
  },
  //  {
  //   name: 'New Year New Gear',
  //   imageDesktop: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/PumaDesktopNewYearNewGear.avif?v=1767685788',
  //   imageMobile: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/PumaMobileNewYearNewGear.avif?v=1767685788',
  //   href: '/collections/puma-women',
  // },
];

const PumaHeroBanners = () => {
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
      <div className="relative -mx-4 hero-slider">
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
                loading="eager"
              />

              {/* HERO TEXT OVERLAY */}
              <div className="absolute -mt-20 inset-0 flex flex-col items-center justify-center text-center">
                <div>
                  <div className="text-2xl md:text-2xl font-extrabold tracking-widest text-white">
                    PUMA
                  </div>
                  {/* <p className="mt-8 text-sm md:text-lg tracking-wider text-white/90">
                    THE LATEST STARTS HERE
                  </p> */}
                </div>

                <div className="flex gap-4 mt-4">
                  <NavLink
                    to="/collections/puma-men"
                    className="bg-white text-black px-6 py-3 text-sm font-semibold"
                  >
                    MEN
                  </NavLink>

                  <NavLink
                    to="/collections/puma-women"
                    className="bg-white text-black px-6 py-3 text-sm font-semibold"
                  >
                    WOMEN
                  </NavLink>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
        {/* Mobile image container as before */}
        <div className="block sm:hidden h-[370px] w-full">
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
                loading="eager"
              />

                 <div className="absolute -mt-20 inset-0 flex flex-col items-center justify-center text-center">
                <div>
                  <div className="text-4xl md:text-4xl font-extrabold tracking-widest text-white">
                    PUMA
                  </div>
                  {/* <p className="mt-8 text-sm md:text-lg tracking-wider text-white/90">
                    THE LATEST STARTS HERE
                  </p> */}
                </div>

                <div className="flex gap-4 mt-4">
                  <NavLink
                    to="/collections/puma-men"
                    className="bg-white text-black px-6 py-3 text-sm font-semibold"
                  >
                    MEN
                  </NavLink>

                  <NavLink
                    to="/collections/puma-women"
                    className="bg-white text-black px-6 py-3 text-sm font-semibold"
                  >
                    WOMEN
                  </NavLink>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Navigation buttons - always centered vertically and inside image container */}
      <button
        className="absolute -bottom-12 lg:bottom-8 left-2 -translate-y-1/2 bg-black/60 hover:bg-black p-2 rounded-full z-5"
        onClick={handlePrev}
      >
        <RxCaretLeft size={24} className="text-white hover:font-bold" />
      </button>
      <button
        className="absolute -bottom-12 lg:bottom-8 right-4 -translate-y-1/2 bg-black/60 hover:bg-black p-2 rounded-full z-5"
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

export default PumaHeroBanners;
