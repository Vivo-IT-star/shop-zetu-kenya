"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const announcements = [
  "100% Genuine Products",
  "Free Shipping on Orders Over Ksh. 10,000",
  "24/7 Customer Support Available",
  "New Arrivals Every Week",
];

const variants = {
  enter: (direction: string) => ({
    x: direction === "next" ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: string) => ({
    x: direction === "next" ? -300 : 300,
    opacity: 0,
  }),
};

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("next");
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setDirection("next");
    setIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setDirection("prev");
    setIndex(
      (prev) => (prev - 1 + announcements.length) % announcements.length,
    );
  };

  return (
    <div className="bg-black dark:bg-white dark:text-black text-white py-2 px-4 -mx-4 flex items-center justify-center relative overflow-hidden">
      <button className="" onClick={handlePrev}>
        <ChevronLeft size={20} />
      </button>

      <div className="relative w-full max-w-md h-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={index}
            animate="center"
            className="absolute w-full text-center font-bold"
            custom={direction}
            exit="exit"
            initial="enter"
            transition={{ duration: 0.5 }}
            variants={variants}
          >
            {announcements[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      <button className="" onClick={handleNext}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default AnnouncementBar;