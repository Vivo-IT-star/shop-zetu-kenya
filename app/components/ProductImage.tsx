import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {useState, useRef, useEffect} from 'react';

type ProductImageProps = {
  images: {
    id: string;
    url: string;
    altText: string | null;
    width: number;
    height: number;
  }[];
  addToCartButton?: React.ReactNode;
  wishlistButton?: React.ReactNode; // 👈 new
};

export function ProductImage({
  images,
  addToCartButton,
  wishlistButton,
}: ProductImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!images || images.length === 0) {
    return <div className="product-image" />;
  }

  // Intersection Observer to track which image is in view (mobile only)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = imageRefs.current.findIndex(
              (ref) => ref === entry.target,
            );
            if (index !== -1 && index !== currentIndex && !isScrolling) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
        rootMargin: '0px',
      },
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      imageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [currentIndex, isScrolling]);

  // Handle touch events for swiping with improved logic
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0); // Reset touch end
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToNext = () => {
    if (isScrolling || currentIndex >= images.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
  };

  const goToPrevious = () => {
    if (isScrolling || currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
  };

  const goToImage = (index: number) => {
    if (isScrolling) return;
    setCurrentIndex(index);
  };

  // Handle scroll synchronization and detect manual scrolling (mobile only)
  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrolling) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const imageWidth = container.clientWidth;

    const exactIndex = scrollLeft / imageWidth;
    const newIndex = Math.round(exactIndex);

    const tolerance = 0.1;
    if (
      Math.abs(exactIndex - newIndex) < tolerance &&
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < images.length
    ) {
      setCurrentIndex(newIndex);
    }
  };

  // Auto-scroll to current image with smooth animation (mobile only)
  useEffect(() => {
    if (scrollContainerRef.current) {
      setIsScrolling(true);
      const container = scrollContainerRef.current;
      const imageWidth = container.clientWidth;

      container.scrollTo({
        left: currentIndex * imageWidth,
        behavior: 'smooth',
      });

      const timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  // Add scroll event listener with better timing (mobile only)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScrollEnd = () => {
        if (!isScrolling) {
          handleScroll();
        }
      };

      let scrollTimeout: NodeJS.Timeout;
      const debouncedScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (!isScrolling) {
            handleScroll();
          }
        }, 150);
      };

      container.addEventListener('scrollend', handleScrollEnd, {passive: true});
      container.addEventListener('scroll', debouncedScroll, {passive: true});

      return () => {
        container.removeEventListener('scrollend', handleScrollEnd);
        container.removeEventListener('scroll', debouncedScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [currentIndex, isScrolling]);

  return (
    <div className="product-image relative">
      {/* Desktop: Thumbnail + Main Image layout */}
      <div className="hidden lg:flex gap-4">
        {/* Thumbnails Column */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 w-16 flex-shrink-0">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`border-2 rounded overflow-hidden transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-gray-900'
                    : 'border-transparent hover:border-gray-400'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  data={image}
                  alt={image.altText || 'Product thumbnail'}
                  sizes="(min-width: 45em) 200px, 100vw"
                  className="w-full h-auto object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="flex-1 relative">
          <Image
            data={images[currentIndex]}
            alt={images[currentIndex].altText || 'Product Image'}
            sizes="(max-width: 720px) 200px, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto"
          />

          {wishlistButton && (
            <div className="absolute top-2 left-2 z-10">{wishlistButton}</div>
          )}
        </div>
      </div>

      {/* Mobile: Horizontal swipe layout */}
      <div className="lg:hidden relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory product-image-swipe"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollSnapStop: 'always',
            scrollBehavior: 'smooth',
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-none w-full snap-start relative"
              ref={(el) => (imageRefs.current[index] = el)}
            >
              <Image
                data={image}
                alt={image.altText || 'Product Image'}
                sizes="(min-width: 45em) 200px, 100vw"
                className="w-full h-auto"
              />

              {/* Wishlist on mobile */}
              {/* Wishlist and Add to Cart fixed on mobile */}
              {wishlistButton && (
                <div className="absolute top-2 left-0 z-5 mobile-wishlist-btn">
                  {wishlistButton}
                </div>
              )}

              {addToCartButton && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90vw] z-30">
                  {addToCartButton}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


//  <div className="product-image">
//       <Image
//         alt={image.altText || 'Product Image'}
//         aspectRatio="9/1"
//         data={image}
//         key={image.id}
//         sizes="(min-width: 45em) 50vw, 100vw"
//       />
//     </div>